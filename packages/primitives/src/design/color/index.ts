// Color: the logic of every Color instrument. culori does the conversions, gamut mapping and
// interpolation; the only formulas written out here are the blend modes, taken from the W3C
// spec. Building blocks first, operations (JSON in, JSON out, see ../operation.ts) at the end.
import {
  useMode, modeOklch, modeOklab, modeRgb, modeLrgb, modeHsl, modeP3, modeOkhsv,
  formatHex, parseHex, parse as parseCss, toGamut, differenceEuclidean, wcagContrast, wcagLuminance,
  interpolate, nearest, colorsNamed,
  type Oklch, type Rgb,
} from 'culori/fn';
import { InputError, type Operation } from '../../operation';

const toOklch = useMode(modeOklch);
const toOklab = useMode(modeOklab);
const toRgb = useMode(modeRgb);
useMode(modeLrgb);
const toHsl = useMode(modeHsl);
const toP3 = useMode(modeP3);
const toOkhsv = useMode(modeOkhsv);

/** An OKLCH color as the sliders hold it. */
export interface Lch {
  l: number;
  c: number;
  h: number;
}

const ok = (c: Lch): Oklch => ({ mode: 'oklch', l: c.l, c: c.c, h: c.h });
const mapToSrgb = toGamut('rgb', 'oklch');
const distance = differenceEuclidean('oklab');

// Colors on the edge of a gamut (pure red, or anything from a hex) come back from OKLCH a hair
// outside 0..1 through float error. That is still inside: clamp it, and snap away the error,
// rather than send it through gamut mapping, which would move it.
const EPS = 1e-4;
const within = (c: { r: number; g: number; b: number }) => [c.r, c.g, c.b].every((v) => v >= -EPS && v <= 1 + EPS);
const snap = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 1e9) / 1e9;
const snapped = <T extends { r: number; g: number; b: number }>(c: T): T => ({ ...c, r: snap(c.r), g: snap(c.g), b: snap(c.b) });

/** The sRGB color actually shown: out-of-gamut colors are mapped in, keeping lightness and hue. */
export const displayed = (c: Lch): Rgb => {
  const rgb = toRgb(ok(c));
  return within(rgb) ? snapped(rgb) : (mapToSrgb(ok(c)) as Rgb);
};
export const hex = (c: Lch) => formatHex(displayed(c));
/**
 * True when the color's sRGB hex stands for it without a visible change: inside sRGB, or
 * so close to its edge that gamut mapping moves it less than a just-noticeable difference.
 */
export const hexSafe = (c: Lch) => distance(ok(c), displayed(c)) < 0.02;

export const round = (n: number, places: number) => Math.round(n * 10 ** places) / 10 ** places;

export function fromHex(input: string): Lch | null {
  const s = input.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return null;
  const parsed = parseHex(`#${s}`);
  if (!parsed) return null;
  const o = toOklch(parsed);
  return { l: o.l, c: o.c, h: o.h ?? 0 };
}

/** WCAG 2.x contrast ratio of the colors as displayed. */
export const ratio = (a: Lch, b: Lch) => wcagContrast(displayed(a), displayed(b));

/** Ratios are rounded down, never up, so 4.499 cannot read as a pass. */
export const ratioText = (r: number) => (Math.floor(r * 100) / 100).toFixed(2);

export type Grade = 'AAA' | 'AA' | 'AA large only' | 'Fails';
export const grade = (r: number): Grade => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large only' : 'Fails');

export interface Fix {
  color: Lch;
  hex: string;
  ratio: number;
  direction: 'darken' | 'lighten';
}

/**
 * The nearest text color that reaches `target` against `b`, keeping hue and chroma:
 * step L by 0.02 away from the background (darker text on light grounds, lighter on dark),
 * and only try the other direction if that fails.
 */
export function fixText(a: Lch, b: Lch, target = 4.5, step = 0.02): Fix | null {
  if (ratio(a, b) >= target) return null;
  const darker = wcagLuminance(displayed(a)) <= wcagLuminance(displayed(b));
  for (const dir of darker ? [-1, 1] : [1, -1]) {
    for (let k = 1; ; k++) {
      const l = Math.min(1, Math.max(0, round(a.l + dir * step * k, 4)));
      const color = { ...a, l };
      const r = ratio(color, b);
      if (r >= target) return { color, hex: hex(color), ratio: r, direction: dir < 0 ? 'darken' : 'lighten' };
      if (l === 0 || l === 1) break;
    }
  }
  return null;
}

/**
 * Any CSS color: hex (the # optional, any case), rgb() or rgba(), hsl(), oklch(), any other
 * CSS color function, or a name. Also three bare 0 to 255 numbers, as design tools show RGB:
 * "197, 54, 55" or "197 54 55". Alpha is read and dropped: these are solid colors.
 */
export type ColorInput = string;

const bareRgb = /^(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})$/;

export function parseColor(input: ColorInput): Lch {
  const text = typeof input === 'string' ? input.trim() : '';
  const triple = bareRgb.exec(text);
  const css = triple && triple.slice(1).every((v) => Number(v) <= 255) ? `rgb(${triple.slice(1).join(' ')})` : /^[0-9a-f]{3,8}$/i.test(text) ? `#${text}` : text;
  const parsed = parseCss(css);
  if (!parsed) throw new InputError(`Not a color: "${input}". Use hex, rgb(), hsl(), oklch() or a CSS color name.`);
  const o = toOklch(parsed);
  return { l: o.l, c: o.c ?? 0, h: o.h ?? 0 };
}

/** The formats people write colors in, in order of how often. */
export const CSS_FORMATS = ['hex', 'rgb', 'hsl', 'oklch'] as const;
export type CssFormat = (typeof CSS_FORMATS)[number];

/** The format a typed color was written in, so a field can answer in the same one. */
export function formatOf(input: string): CssFormat {
  const text = input.trim().toLowerCase();
  if (text.startsWith('rgb') || bareRgb.test(text)) return 'rgb';
  if (text.startsWith('hsl')) return 'hsl';
  if (/^(oklch|oklab|lab|lch|color)\(/.test(text)) return 'oklch';
  return 'hex';
}

/** A color as operations return it: the sRGB hex that is shown, and its OKLCH. */
export interface ColorOut {
  hex: string;
  oklch: Lch;
}

const out = (c: Lch): ColorOut => ({ hex: hex(c), oklch: { l: round(c.l, 4), c: round(c.c, 4), h: round(c.h, 2) } });

// ── Gamut, CSS text and named colors ──────────────────────────────────────────────────

/** Where a color can be shown as chosen: inside sRGB, inside Display P3 only, or beyond both. */
export type Gamut = 'srgb' | 'p3' | 'wider';

/**
 * The sRGB channels when sRGB can show the color as chosen, otherwise null. For drawing the
 * gamut's edge, so it holds to a tighter tolerance than reading colors does: near black, where
 * channels are tiny, the looser one would paint a sliver of colors that are not really there.
 */
export const inSrgb = (c: Lch): Rgb | null => {
  const rgb = toRgb(ok(c));
  return [rgb.r, rgb.g, rgb.b].every((v) => v >= -1e-6 && v <= 1 + 1e-6) ? snapped(rgb) : null;
};

/**
 * The color brought inside sRGB by lowering its chroma to the most that fits, keeping lightness
 * and hue exact. For colors written as hex, so the text and the color shown are the same color.
 * Chroma is rounded down to 4 places, so the rounded value stays inside too.
 */
export const fitSrgb = (c: Lch): Lch => {
  if (within(toRgb(ok(c)))) return c;
  let lo = 0;
  let hi = c.c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (within(toRgb(ok({ ...c, c: mid })))) lo = mid;
    else hi = mid;
  }
  return { l: c.l, c: Math.floor(lo * 1e4) / 1e4, h: c.h };
};

export const gamutOf = (c: Lch): Gamut => (within(toRgb(ok(c))) ? 'srgb' : within(toP3(ok(c))) ? 'p3' : 'wider');

/**
 * Below this chroma a color is a gray and its hue is powerless (CSS Color 4):
 * it is written as 0, and a mix takes the other color's hue.
 */
const POWERLESS = 2e-4;
const hueOf = (c: Lch) => (c.c < POWERLESS ? 0 : ((c.h % 360) + 360) % 360);

/** A number as CSS writes it: rounded, no trailing zeros, no negative zero. */
const num = (n: number, places: number) => String(round(n, places) + 0);
const angle = (h: number) => (num(h, 1) === '360' ? '0' : num(h, 1));

export const cssOklch = (c: Lch) => `oklch(${num(c.l, 3)} ${num(c.c, 3)} ${angle(hueOf(c))})`;
/** The shortest CSS that stands for the color: its hex when sRGB can show it, oklch() when not. */
export const cssColor = (c: Lch) => (hexSafe(c) ? hex(c) : cssOklch(c));

const mapToP3 = toGamut('p3', 'oklch');
const named = Object.entries(colorsNamed).map(([name, value]) => ({ name, hex: `#${value.toString(16).padStart(6, '0')}` }));
const nearestNamed = nearest(named, differenceEuclidean('oklab'), (n) => parseHex(n.hex)!);

export interface Formats {
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
  oklab: string;
  p3: string;
  /** The CSS color name nearest to the color as shown, and whether it is the same color. */
  named: { name: string; exact: boolean };
}

/**
 * The color in every CSS format. hex, rgb() and hsl() describe the color as sRGB shows it
 * (all three agree to the 8-bit channel); oklch(), oklab() and the P3 value describe the
 * color as chosen, mapped into P3 only when it lies beyond it.
 */
/** The color written in one format: hex, rgb() and hsl() as sRGB shows it, oklch() as chosen. */
export function formatAs(c: Lch, format: CssFormat): string {
  if (format === 'oklch') return cssOklch(c);
  const shown = formatHex(displayed(c));
  if (format === 'hex') return shown;
  const rgb8 = parseHex(shown)!;
  if (format === 'rgb') return `rgb(${[rgb8.r, rgb8.g, rgb8.b].map((v) => Math.round(v * 255)).join(' ')})`;
  const hsl = toHsl(rgb8);
  return `hsl(${angle(hsl.h ?? 0)} ${num((hsl.s ?? 0) * 100, 1)}% ${num(hsl.l * 100, 1)}%)`;
}

/** A color as three numbers in one format: RGB 0 to 255, HSL in degrees and percent, OKLCH. */
export type Channels = [number, number, number];
export type ChannelFormat = Exclude<CssFormat, 'hex'>;

/** The numbers a picker shows for the color, rounded as formatAs() writes them, so the two agree. */
export function channelsOf(c: Lch, format: ChannelFormat): Channels {
  if (format === 'oklch') return [round(c.l, 3), round(c.c, 3), Number(angle(hueOf(c)))];
  const rgb8 = parseHex(formatHex(displayed(c)))!;
  if (format === 'rgb') return [Math.round(rgb8.r * 255), Math.round(rgb8.g * 255), Math.round(rgb8.b * 255)];
  const hsl = toHsl(rgb8);
  return [Number(angle(hsl.h ?? 0)), round((hsl.s ?? 0) * 100, 1), round(hsl.l * 100, 1)];
}

/** The color three numbers stand for, read the way CSS reads them. */
export function fromChannels(format: ChannelFormat, [x, y, z]: Channels): Lch {
  return parseColor(format === 'hsl' ? `hsl(${x} ${y}% ${z}%)` : `${format}(${x} ${y} ${z})`);
}

/**
 * Okhsv, Björn Ottosson's 2021 remake of HSV on Oklab, for the familiar picker: a square of
 * saturation and value at one hue, and a hue strip. Unlike HSV its hues are evenly spaced,
 * and like HSV the square holds exactly the colors sRGB can show.
 */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

const unit = (v: number | undefined) => Math.min(1, Math.max(0, v ?? 0));

/** A color's place in the picker. Grays have no hue; they keep `hue`, the one last shown. */
export function toHsv(c: Lch, hue = 0): Hsv {
  const o = toOkhsv(ok(c));
  const gray = !o.s || o.s < 1e-4 || o.h === undefined;
  return { h: gray ? hue : o.h!, s: gray ? 0 : unit(o.s), v: unit(o.v) };
}

export function fromHsv(x: Hsv): Lch {
  const o = toOklch({ mode: 'okhsv', h: x.h, s: x.s, v: x.v });
  return { l: o.l, c: o.c ?? 0, h: o.h ?? x.h };
}

/** The sRGB channels (0 to 1) of a point in the picker, for painting it. */
export const hsvRgb = (x: Hsv) => snapped(toRgb({ mode: 'okhsv', h: x.h, s: x.s, v: x.v }));

export function formats(c: Lch): Formats {
  const shown = formatHex(displayed(c));
  const rgb8 = parseHex(shown)!;
  const lab = toOklab(ok(c));
  const inP3 = toP3(ok(c));
  const p3 = within(inP3) ? snapped(inP3) : toP3(mapToP3(ok(c)));
  const p3Channel = (v: number) => num(Math.min(1, Math.max(0, v)), 4);
  const near = nearestNamed(rgb8)[0];
  return {
    hex: shown,
    rgb: formatAs(c, 'rgb'),
    hsl: formatAs(c, 'hsl'),
    oklch: cssOklch(c),
    oklab: `oklab(${num(lab.l, 3)} ${num(lab.a, 3)} ${num(lab.b, 3)})`,
    p3: `color(display-p3 ${p3Channel(p3.r)} ${p3Channel(p3.g)} ${p3Channel(p3.b)})`,
    named: { name: near.name, exact: near.hex === shown },
  };
}

// ── Scale ────────────────────────────────────────────────────────────────────────────

export const SCALE_NAMES = ['100', '200', '300', '400', '500', '600', '700'] as const;
/** Lightness between neighboring steps. Even in OKLCH, so the steps look even. */
export const SCALE_STEP = 0.1;

export interface Step {
  name: (typeof SCALE_NAMES)[number];
  color: Lch;
  /** The step the base color sits on, exactly. */
  base: boolean;
}

/**
 * Seven steps of lightness 0.1 apart, lightest first, keeping the base's hue and chroma.
 * The ladder is placed so the base color is one of the steps, as near the middle as the
 * range 0.2 to 0.98 allows. Each step is brought inside sRGB (lower chroma, same lightness
 * and hue), so its hex and its oklch() are the same color.
 */
export function scaleOf(base: Lch): Step[] {
  const last = SCALE_NAMES.length - 1;
  const lo = Math.min(0.2, base.l);
  const hi = Math.max(0.98, base.l);
  const kMin = Math.max(0, Math.ceil(last - (base.l - lo) / SCALE_STEP - 1e-9));
  const kMax = Math.min(last, Math.floor((hi - base.l) / SCALE_STEP + 1e-9));
  const k = Math.min(kMax, Math.max(kMin, Math.round((0.95 - base.l) / SCALE_STEP)));
  return SCALE_NAMES.map((name, i) => ({ name, color: fitSrgb({ ...base, l: round(base.l + (k - i) * SCALE_STEP, 4) }), base: i === k }));
}

/** The scale as CSS custom properties, each step written in `format` (hex unless you ask). */
export const scaleCss = (steps: Step[], prefix = '--color', format: CssFormat = 'hex') =>
  steps.map((s) => `${prefix}-${s.name}: ${formatAs(s.color, format)};`).join('\n');

// ── Harmony ──────────────────────────────────────────────────────────────────────────

/** Hue offsets from the base color, in degrees, in the order they are shown. */
export const RULES = {
  analogous: [-60, -30, 0, 30, 60],
  complementary: [0, 180],
  split: [0, 150, 210],
  triadic: [0, 120, 240],
  square: [0, 90, 180, 270],
} as const;
export type Rule = keyof typeof RULES;
export const RULE_NAMES = Object.keys(RULES) as Rule[];

/**
 * The base turned around the hue circle, keeping its lightness and chroma. A hue that cannot
 * hold that chroma inside sRGB is brought in with less, at the same lightness.
 */
export const harmonyOf = (base: Lch, rule: Rule) =>
  RULES[rule].map((offset) => ({ offset, color: fitSrgb({ ...base, h: (((base.h + offset) % 360) + 360) % 360 }) }));

// ── Blend ────────────────────────────────────────────────────────────────────────────

export const BLEND_MODES = ['mix', 'opacity', 'multiply', 'screen', 'overlay'] as const;
export type BlendMode = (typeof BLEND_MODES)[number];

// Separable blend modes as W3C Compositing and Blending Level 1 defines them:
// cb is the backdrop, cs the source, both gamma-encoded sRGB channels from 0 to 1.
// (culori's overlay and hard-light drop a term, so they are written out here.)
const multiplyChannel = (cb: number, cs: number) => cb * cs;
const screenChannel = (cb: number, cs: number) => cb + cs - cb * cs;
const hardLightChannel = (cb: number, cs: number) => (cs <= 0.5 ? multiplyChannel(cb, 2 * cs) : screenChannel(cb, 2 * cs - 1));
export const blendChannel = {
  normal: (_cb: number, cs: number) => cs,
  multiply: multiplyChannel,
  screen: screenChannel,
  overlay: (cb: number, cs: number) => hardLightChannel(cs, cb),
};

// A gray's hue is powerless: left out, a mix takes the other color's hue (CSS Color 4).
const forMix = (c: Lch): Oklch => ({ mode: 'oklch', l: c.l, c: c.c, h: c.c < POWERLESS ? undefined : c.h });

/**
 * `top` over `bottom`, as sRGB shows the result. `amount` (0 to 1) is how much of top:
 * its weight in a mix, its layer's opacity otherwise.
 * - mix: CSS color-mix() in OKLCH, hue the shorter way round.
 * - opacity: top at `amount` over bottom, composited in sRGB as browsers do; the same
 *   color as color-mix() in sRGB.
 * - multiply, screen, overlay: CSS mix-blend-mode, with the layer at `amount` opacity.
 */
export function blendOf(top: Lch, bottom: Lch, mode: BlendMode, amount: number): Rgb {
  if (mode === 'mix') {
    const mixed = interpolate([forMix(bottom), forMix(top)], 'oklch')(amount);
    const rgb = toRgb(mixed);
    return within(rgb) ? snapped(rgb) : (mapToSrgb(mixed) as Rgb);
  }
  const cb = displayed(bottom);
  const cs = displayed(top);
  const f = blendChannel[mode === 'opacity' ? 'normal' : mode];
  const channel = (b: number, s: number) => (1 - amount) * b + amount * f(b, s);
  return snapped({ mode: 'rgb' as const, r: channel(cb.r, cs.r), g: channel(cb.g, cs.g), b: channel(cb.b, cs.b) });
}

/** The CSS that makes the blend: a color-mix() value, or the properties for the top layer. */
export function blendCss(top: Lch, bottom: Lch, mode: BlendMode, amount: number, formats?: { top: CssFormat; bottom: CssFormat }): string {
  const write = (c: Lch, f?: CssFormat) => (f ? formatAs(c, f) : cssColor(c));
  const pct = `${num(amount * 100, 1)}%`;
  if (mode === 'mix') return `color-mix(in oklch, ${write(top, formats?.top)} ${pct}, ${write(bottom, formats?.bottom)})`;
  if (mode === 'opacity') return `color-mix(in srgb, ${write(top, formats?.top)} ${pct}, ${write(bottom, formats?.bottom)})`;
  return `mix-blend-mode: ${mode};${amount < 1 ? ` opacity: ${num(amount, 3)};` : ''}`;
}

/** The OKLCH of a blend result, for the rest of the tooling. */
export const lchOf = (c: Rgb): Lch => {
  const o = toOklch(c);
  return { l: o.l, c: o.c ?? 0, h: o.h ?? 0 };
};

// ── Operations: one per instrument, keyed by its slug ──────────────────────────────────

export interface ContrastInput {
  text: ColorInput;
  background: ColorInput;
}

export interface ContrastOutput {
  text: ColorOut;
  background: ColorOut;
  /** WCAG 2.x contrast ratio, rounded down to two decimals so a fail never reads as a pass. */
  ratio: number;
  grade: Grade;
  /** WCAG 2.2 SC 1.4.3 (AA) and 1.4.6 (AAA); large is 24 px, or 18.66 px bold, and up. */
  passes: { bodyAA: boolean; largeAA: boolean; bodyAAA: boolean; largeAAA: boolean };
  /** The nearest text color that passes body AA, keeping hue and chroma; null if it passes. */
  fix: { text: ColorOut; ratio: number; direction: Fix['direction'] } | null;
}

export const contrast: Operation<ContrastInput, ContrastOutput> = ({ text, background }) => {
  const a = parseColor(text);
  const b = parseColor(background);
  const r = ratio(a, b);
  const fix = fixText(a, b);
  return {
    text: out(a),
    background: out(b),
    ratio: Number(ratioText(r)),
    grade: grade(r),
    passes: { bodyAA: r >= 4.5, largeAA: r >= 3, bodyAAA: r >= 7, largeAAA: r >= 4.5 },
    fix: fix && { text: out(fix.color), ratio: Number(ratioText(fix.ratio)), direction: fix.direction },
  };
};

const numberIn = (name: string, v: unknown, min: number, max: number) => {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) {
    throw new InputError(`${name} must be a number from ${min} to ${max}.`);
  }
  return v;
};

export interface PickInput {
  /** Lightness, 0 to 1. */
  l: number;
  /** Chroma, 0 to 0.4. */
  c: number;
  /** Hue in degrees. */
  h: number;
}

export interface PickOutput {
  color: ColorOut;
  /** The color as CSS writes it, exactly as chosen. */
  oklch: string;
  /** Where screens can show it as chosen; outside sRGB, `color.hex` is the nearest sRGB color. */
  gamut: Gamut;
}

export const pick: Operation<PickInput, PickOutput> = ({ l, c, h }) => {
  const color = { l: numberIn('l', l, 0, 1), c: numberIn('c', c, 0, 0.4), h: ((numberIn('h', h, -3600, 3600) % 360) + 360) % 360 };
  return { color: out(color), oklch: cssOklch(color), gamut: gamutOf(color) };
};

export interface ScaleInput {
  color: ColorInput;
}

export interface ScaleOutput {
  base: ColorOut;
  /** Lightest first, 0.1 apart in OKLCH lightness; `base` marks the step the color sits on. */
  steps: (ColorOut & { name: Step['name']; base: boolean })[];
  /** CSS custom properties, one per step. */
  css: string;
}

export const scale: Operation<ScaleInput, ScaleOutput> = ({ color }) => {
  const base = parseColor(color);
  const steps = scaleOf(base);
  return { base: out(base), steps: steps.map((s) => ({ name: s.name, base: s.base, ...out(s.color) })), css: scaleCss(steps) };
};

export interface HarmonyInput {
  color: ColorInput;
  /** analogous (the default), complementary, split, triadic or square. */
  rule?: Rule;
}

export interface HarmonyOutput {
  rule: Rule;
  /** The base and its partners, same lightness and chroma; `offset` is degrees from the base hue. */
  colors: (ColorOut & { offset: number })[];
}

export const harmony: Operation<HarmonyInput, HarmonyOutput> = ({ color, rule = 'analogous' }) => {
  if (!RULE_NAMES.includes(rule)) throw new InputError(`rule must be one of ${RULE_NAMES.join(', ')}.`);
  const base = parseColor(color);
  return { rule, colors: harmonyOf(base, rule).map((x) => ({ offset: x.offset, ...out(x.color) })) };
};

export interface ConvertInput {
  color: ColorInput;
}

export type ConvertOutput = Formats & { gamut: Gamut };

export const convert: Operation<ConvertInput, ConvertOutput> = ({ color }) => {
  const c = parseColor(color);
  return { ...formats(c), gamut: gamutOf(c) };
};

export interface BlendInput {
  /** The color on top: the source layer. */
  top: ColorInput;
  /** The color underneath: the backdrop. */
  bottom: ColorInput;
  /** mix (the default), opacity, multiply, screen or overlay. */
  mode?: BlendMode;
  /** How much of top, 0 to 1: its weight in a mix, its opacity otherwise. Default 0.5. */
  amount?: number;
}

export interface BlendOutput {
  result: ColorOut;
  /** CSS that produces the result. */
  css: string;
}

export const blend: Operation<BlendInput, BlendOutput> = ({ top, bottom, mode = 'mix', amount = 0.5 }) => {
  if (!BLEND_MODES.includes(mode)) throw new InputError(`mode must be one of ${BLEND_MODES.join(', ')}.`);
  const t = parseColor(top);
  const b = parseColor(bottom);
  const a = numberIn('amount', amount, 0, 1);
  return { result: out(lchOf(blendOf(t, b, mode, a))), css: blendCss(t, b, mode, a) };
};

export const operations = { pick, scale, contrast, harmony, convert, blend };
