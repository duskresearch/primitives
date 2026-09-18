// Proactive filtering for suggestions: no CAPTCHA, no accounts. Every check is local and
// deterministic. A suggestion is refused (never stored as an idea), held (stored, shown
// only after review) or accepted (live at once).
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';
import bigrams from './bigrams.json';

export type Verdict =
  | { outcome: 'accept' | 'hold'; name: string; detail: string | null; reason?: string }
  | { outcome: 'refuse'; reason: string };

const profanity = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });

// Letters-in-a-row model from ~236,000 English words (scripts/build-bigrams.mjs).
const symbolIndex = Object.fromEntries([...bigrams.symbols].map((c, i) => [c, i]));
export function wordScore(word: string): number {
  const s = `^${word.toLowerCase()}$`;
  let total = 0;
  for (let i = 0; i < s.length - 1; i++) total += bigrams.logp[symbolIndex[s[i]]][symbolIndex[s[i + 1]]];
  return total / (s.length - 1);
}
const REFUSE_BELOW = -4.2;
const HOLD_BELOW = -3.4;

// Terms that read as noise to a letter model but are ordinary in design work.
const allowed = new Set(
  'css svg rgb rgba hsl hsla oklch oklab lch lab srgb p3 cmyk px rem em vh vw ch pt ui ux api json xml png jpg jpeg webp avif gif pdf emoji wcag apca aria dpi ppi hdr lottie figma html js ts 2d 3d a11y i18n svgs gifs'.split(' '),
);

// Rows and runs of a QWERTY keyboard, both directions: "asdf", "poiu", "zxcv".
const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890'];
const keyboardRun = (w: string) =>
  w.length >= 4 && rows.some((r) => [...Array(w.length - 3).keys()].some((i) => r.includes(w.slice(i, i + 4)) || [...r].reverse().join('').includes(w.slice(i, i + 4))));

const trolls = new Set(
  'test testing tester hello hi hey yo lol lmao rofl idk nothing none nope na n/a whatever qwerty asdf spam ok okay yes no abc xyz foo bar baz blah meh hmm hm nah sup gg ez anything something stuff random idea ideas'.split(' '),
);

// Enough of the vocabulary of design work to tell a suggestion from an off-topic word.
// Matched on word starts, so "animat" covers animate, animation, animated.
const lexicon =
  'color colour palett hue tint shade gradient contrast type typo font typeface letter kern track ligat glyph text serif sans mono script grid layout column row spac space margin padding gap gutter breakpoint responsive shape form corner radius border stroke outline line curve bezier path polygon blob circle square triangle star arrow chevron divider wave zigzag shadow light depth elevat blur glass frost noise grain textur pattern stripe dot check tile icon logo favicon emoji illustrat image photo video sound audio voice music haptic vibrat motion animat ease easing spring durat transit scroll stagger keyframe timing perspect isometric 3d 2d ratio aspect crop proportion golden random uuid dice seed shuffle state machine token theme dark light mode access a11y focus cursor pointer button input field select toggle switch slider chart graph data viz visual map table print email pdf svg css html ui ux brand mockup wirefram prototyp design vision blind dither pixel vector raster resolut dpi screen device mobile frame measur unit rem px scale size weight variable axes axis featur opentype fallback specimen pairing rhythm baseline masonry bento card modal avatar badge cmyk pantone oklch hsl rgb hex print paper fold spline morph loop sprite render lottie figma sketch contour hatch halftone mesh isotype pictogram number numeral figure tabular spacing whitespace kerning leading alignment align justify hyphen widow orphan rag measure clamp fluid container query viewport safe area notch'
    .split(' ');
const relevant = (words: string[]) => words.some((w) => allowed.has(w) || lexicon.some((stem) => w.startsWith(stem)));

const tidy = (s: string) =>
  s
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const LINKISH = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|app|dev|xyz|ru|cn|info|biz|me|ly|gg)\b|@|\b\d{7,}\b)/i;
const MARKUP = /[<>{}[\]\\|`^~=_*#$%]/;

/** Why a piece of text is not a suggestion, or null if it reads like one. */
function problem(text: string, maxWords: number): { refuse: string } | { hold: string } | null {
  if (LINKISH.test(text)) return { refuse: 'link' };
  if (MARKUP.test(text)) return { refuse: 'markup' };
  // Also check with spaced-out letters joined ("f u c k"), without joining whole words.
  const squeezed = text.replace(/(?:\b\p{L}[\s.\-*]+){2,}\p{L}\b/gu, (run) => run.replace(/[^\p{L}]/gu, ''));
  if (profanity.hasMatch(text) || profanity.hasMatch(squeezed)) return { refuse: 'nsfw' };
  const letters = (text.match(/\p{L}/gu) ?? []).length;
  const visible = text.replace(/\s/g, '').length;
  if (!letters || letters / visible < 0.7) return { refuse: 'symbols' };
  const words = text.split(' ');
  if (words.length > maxWords) return { refuse: 'too long' };
  let hold: string | null = null;
  for (const raw of words) {
    const w = raw.toLowerCase().replace(/[^\p{L}\d]/gu, '');
    if (!w || allowed.has(w)) continue;
    if (/(.)\1{3,}/.test(w)) return { refuse: 'repeats' };
    if (w.length >= 4 && /^(.{1,3})\1+.?$/.test(w)) return { refuse: 'repeats' };
    if (keyboardRun(w)) return { refuse: 'keyboard' };
    if (!/^[a-z]+$/.test(w)) continue; // other scripts and numbers: no English model to judge by
    const acronym = /^[A-Z]{2,5}$/.test(raw.replace(/[^\p{L}]/gu, ''));
    if (acronym || w.length < 3) continue;
    if (!/[aeiouy]/.test(w) || /[^aeiouy]{6,}/.test(w)) return { refuse: 'gibberish' };
    const score = wordScore(w);
    if (score < REFUSE_BELOW) return { refuse: 'gibberish' };
    if (score < HOLD_BELOW) hold = 'unusual word';
  }
  return hold ? { hold } : null;
}

/** Title-ish display: first letter up, shouting calmed, everything else as typed. */
function display(name: string) {
  const calm = /^[^a-z]*$/.test(name) && name.replace(/[^A-Z]/g, '').length > 5 ? name.toLowerCase() : name;
  return calm.charAt(0).toUpperCase() + calm.slice(1);
}

export function moderate(input: { name: unknown; detail?: unknown }): Verdict {
  const name = tidy(String(input.name ?? ''));
  const detail = tidy(String(input.detail ?? ''));
  if (name.length < 2 || name.length > 48) return { outcome: 'refuse', reason: 'length' };
  if (detail.length > 100) return { outcome: 'refuse', reason: 'length' };
  if (trolls.has(name.toLowerCase().replace(/[^a-z/]/g, ''))) return { outcome: 'refuse', reason: 'not a suggestion' };

  const n = problem(name, 5);
  if (n && 'refuse' in n) return { outcome: 'refuse', reason: n.refuse };
  const d = detail ? problem(detail, 18) : null;
  if (d && 'refuse' in d) return { outcome: 'refuse', reason: d.refuse };

  const words = `${name} ${detail}`.toLowerCase().split(/[^\p{L}\d]+/u).filter(Boolean);
  const hold = (n && 'hold' in n && n.hold) || (d && 'hold' in d && d.hold) || (!relevant(words) && 'off topic');
  return { outcome: hold ? 'hold' : 'accept', name: display(name), detail: detail ? display(detail) : null, ...(hold ? { reason: hold } : {}) };
}
