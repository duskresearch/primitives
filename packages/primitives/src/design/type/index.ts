// Type: modular scales, units, measure, fallback metrics, font embeds and pairings. Every
// formula is a published one (cited where it is used). Building blocks first, then the
// operations (JSON in, JSON out, see ../../operation.ts) at the end.
import { InputError, type Operation } from '../../operation';

const round = (n: number, places: number) => Math.round(n * 10 ** places) / 10 ** places;
/** A number as CSS writes it: rounded, no trailing zeros, no negative zero. */
const num = (n: number, places: number) => String(round(n, places) + 0);

/** The browser's default root size: 1rem. */
export const ROOT = 16;

// ── Scale ────────────────────────────────────────────────────────────────────────────

/** Ratios named for the musical intervals they come from, as type scales name them. */
export const RATIOS = {
  'minor-second': 1.067,
  'major-second': 1.125,
  'minor-third': 1.2,
  'major-third': 1.25,
  'perfect-fourth': 1.333,
  'augmented-fourth': 1.414,
  'perfect-fifth': 1.5,
  golden: 1.618,
} as const;
export type RatioName = keyof typeof RATIOS;

/** Steps below and above the base, named as Tailwind names them, so the CSS drops in. */
export const STEPS = [
  ['xs', -2],
  ['sm', -1],
  ['base', 0],
  ['lg', 1],
  ['xl', 2],
  ['2xl', 3],
  ['3xl', 4],
  ['4xl', 5],
] as const;
export type StepName = (typeof STEPS)[number][0];

/**
 * Leading for a size: the line box is the size plus a fixed 8px, so body text gets about
 * 1.5 and large headings close to 1.1, the tightening type scales apply by hand.
 */
export const leadingFor = (px: number) => round(Math.min(1.5, Math.max(1.1, (px + 8) / px)), 2);

export interface ScaleStep {
  name: StepName;
  /** Steps from the base: 0 is the base, 1 one ratio up. */
  n: number;
  px: number;
  rem: number;
  leading: number;
}

export function scaleOf(base: number, ratio: number): ScaleStep[] {
  return STEPS.map(([name, n]) => {
    const px = base * ratio ** n;
    return { name, n, px: round(px, 2), rem: round(px / ROOT, 4), leading: leadingFor(px) };
  });
}

export interface Fluid {
  /** Screen widths, in px, where the small and the large scale apply. */
  minViewport: number;
  maxViewport: number;
  /** The scale on the small screen. */
  minBase: number;
  minRatio: number;
}

/**
 * A size that grows with the screen between two scales, as CSS clamp(): linear between
 * the two viewports, fixed outside them. The method Utopia popularized.
 */
export function clampFor(minPx: number, maxPx: number, minViewport: number, maxViewport: number): string {
  const slope = (maxPx - minPx) / (maxViewport - minViewport);
  const intercept = minPx - slope * minViewport;
  const lo = Math.min(minPx, maxPx);
  const hi = Math.max(minPx, maxPx);
  // A step that shrinks as the screen grows (small steps when the large ratio is wider)
  // has a negative slope, written as a subtraction.
  const vw = `${slope < 0 ? '-' : '+'} ${num(Math.abs(slope) * 100, 4)}vw`;
  return `clamp(${num(lo / ROOT, 4)}rem, ${num(intercept / ROOT, 4)}rem ${vw}, ${num(hi / ROOT, 4)}rem)`;
}

/** The scale as CSS custom properties in Tailwind's theme shape: a size and its line height. */
export function scaleCss(base: number, ratio: number, fluid?: Fluid): string {
  const large = scaleOf(base, ratio);
  const small = fluid ? scaleOf(fluid.minBase, fluid.minRatio) : null;
  return large
    .map((s, i) => {
      const size = small ? clampFor(small[i].px, s.px, fluid!.minViewport, fluid!.maxViewport) : `${num(s.rem, 4)}rem`;
      return `--text-${s.name}: ${size};\n--text-${s.name}--line-height: ${s.leading};`;
    })
    .join('\n');
}

// ── Units ────────────────────────────────────────────────────────────────────────────

export const UNITS = ['px', 'rem', 'em', 'pt', '%'] as const;
export type Unit = (typeof UNITS)[number];

/** CSS fixes 1in at 96px and at 72pt, so 1pt is 4/3 px (CSS Values and Units 4). */
export const PX_PER_PT = 96 / 72;

/**
 * A length in every unit. rem is against the root size, em and % against the size of the
 * element's own text (the context).
 */
export function convertLength(value: number, unit: Unit, root = ROOT, context = ROOT): Record<Unit, number> {
  const px = { px: value, rem: value * root, em: value * context, pt: value * PX_PER_PT, '%': (value / 100) * context }[unit];
  return { px: round(px, 3), rem: round(px / root, 4), em: round(px / context, 4), pt: round(px / PX_PER_PT, 3), '%': round((px / context) * 100, 2) };
}

export const TRACKING_UNITS = ['percent', 'thousandths', 'px', 'em'] as const;
export type TrackingUnit = (typeof TRACKING_UNITS)[number];

/**
 * Letter-spacing in em, as CSS wants it, from how design tools write it: Figma as a percent
 * of the font size, Adobe apps in thousandths of an em, or px at a given font size.
 */
export function trackingEm(value: number, unit: TrackingUnit, fontSize = ROOT): number {
  const em = { percent: value / 100, thousandths: value / 1000, px: value / fontSize, em: value }[unit];
  return round(em, 4);
}

// ── Measure ──────────────────────────────────────────────────────────────────────────

/**
 * Characters per line: 45 to 75 is comfortable for a single column, 66 the ideal
 * (Bringhurst, The Elements of Typographic Style); WCAG 2.2 success criterion 1.4.8 (AAA)
 * asks for no more than 80.
 */
export const MEASURE = { min: 45, ideal: 66, max: 75, wcag: 80 } as const;
export type Band = 'short' | 'comfortable' | 'long' | 'too long';
export const bandOf = (chars: number): Band =>
  chars < MEASURE.min ? 'short' : chars <= MEASURE.max ? 'comfortable' : chars <= MEASURE.wcag ? 'long' : 'too long';

/** Characters that fit on a line: the width over the average character's width at that size. */
export const charactersPerLine = (width: number, fontSize: number, averageWidthEm: number) => Math.floor(width / (fontSize * averageWidthEm));

// ── Fonts: metrics, fallbacks, embeds, pairings ──────────────────────────────────────

/** A face's vertical and horizontal measurements, in font units (from Capsize). */
export interface Metrics {
  unitsPerEm: number;
  ascent: number;
  descent: number;
  lineGap: number;
  capHeight: number;
  xHeight: number;
  /** Average width of Latin text, weighted by how often letters occur. */
  xWidthAvg: number;
}

/** Metrics as stored in fonts.json: [upm, ascent, descent, lineGap, capHeight, xHeight, xWidthAvg]. */
export const metricsFrom = (m: number[]): Metrics => ({ unitsPerEm: m[0], ascent: m[1], descent: m[2], lineGap: m[3], capHeight: m[4], xHeight: m[5], xWidthAvg: m[6] });

export const xHeightRatio = (m: Metrics) => m.xHeight / m.unitsPerEm;
export const widthRatio = (m: Metrics) => m.xWidthAvg / m.unitsPerEm;

export interface Overrides {
  sizeAdjust: number;
  ascentOverride: number;
  descentOverride: number;
  lineGapOverride: number;
}

/**
 * The @font-face descriptors (CSS Fonts 5) that make a local fallback take up the space the
 * webfont will: scale its width to match, then set its vertical metrics to the webfont's,
 * divided by that scale. The method Capsize and Next.js use.
 */
export function overridesFor(font: Metrics, fallback: Metrics): Overrides {
  const sizeAdjust = widthRatio(font) / widthRatio(fallback);
  return {
    sizeAdjust: round(sizeAdjust * 100, 2),
    ascentOverride: round((font.ascent / font.unitsPerEm / sizeAdjust) * 100, 2),
    descentOverride: round((Math.abs(font.descent) / font.unitsPerEm / sizeAdjust) * 100, 2),
    lineGapOverride: round((font.lineGap / font.unitsPerEm / sizeAdjust) * 100, 2),
  };
}

const generic = { sans: 'sans-serif', serif: 'serif', mono: 'monospace', display: 'sans-serif', handwriting: 'cursive' } as const;
export type Category = keyof typeof generic;

export function fallbackCss(family: string, fallbackFamily: string, o: Overrides, category: Category = 'sans'): string {
  return [
    '@font-face {',
    `  font-family: "${family} Fallback";`,
    `  src: local("${fallbackFamily}");`,
    `  size-adjust: ${o.sizeAdjust}%;`,
    `  ascent-override: ${o.ascentOverride}%;`,
    `  descent-override: ${o.descentOverride}%;`,
    `  line-gap-override: ${o.lineGapOverride}%;`,
    '}',
    '',
    `font-family: "${family}", "${family} Fallback", ${generic[category]};`,
  ].join('\n');
}

export interface Face {
  /** Fontsource id, e.g. "inter". */
  id: string;
  family: string;
  weights: number[];
  italic?: boolean;
  variable?: boolean;
}

/** Ways to put a family on a page: Google's own embed, or the same files self-hosted. */
export function embeds(face: Face, weights: number[] = [400, 700]) {
  const w = weights.filter((x) => face.weights.includes(x));
  const use = w.length ? w : [face.weights.includes(400) ? 400 : face.weights[0]];
  const name = face.family.replace(/ /g, '+');
  const spec = face.variable
    ? face.italic
      ? `ital,wght@0,${Math.min(...face.weights)}..${Math.max(...face.weights)};1,${Math.min(...face.weights)}..${Math.max(...face.weights)}`
      : `wght@${Math.min(...face.weights)}..${Math.max(...face.weights)}`
    : face.italic
      ? `ital,wght@${[...use.map((x) => `0,${x}`), ...use.map((x) => `1,${x}`)].join(';')}`
      : `wght@${use.join(';')}`;
  const pkg = face.variable ? `@fontsource-variable/${face.id}` : `@fontsource/${face.id}`;
  return {
    google: `<link href="https://fonts.googleapis.com/css2?family=${name}:${spec}&display=swap" rel="stylesheet">`,
    npm: `npm install ${pkg}`,
    import: face.variable ? `@import "${pkg}";` : use.map((x) => `@import "${pkg}/${x}.css";`).join('\n'),
    css: `font-family: "${face.family}";`,
  };
}

export interface Candidate {
  id: string;
  category: Category;
  metrics: Metrics | null;
  /** Rank on Google Fonts: 1 is the most used. */
  popularity: number;
}

/**
 * Faces that pair with one: a different category (a serif with a sans), close in x-height so
 * the two sit together at one size, and well used, so the pair is proven. Best first.
 */
export function pairingsFor(face: Candidate, candidates: Candidate[], count = 3): Candidate[] {
  if (!face.metrics) return [];
  const x = xHeightRatio(face.metrics);
  const partner: Partial<Record<Category, Category[]>> = { sans: ['serif'], serif: ['sans'], display: ['sans', 'serif'], handwriting: ['sans', 'serif'], mono: ['sans'] };
  return candidates
    .filter((c) => c.id !== face.id && c.metrics && (partner[face.category] ?? []).includes(c.category) && c.popularity <= 400)
    .map((c) => ({ c, score: Math.abs(xHeightRatio(c.metrics!) - x) * 20 + Math.log10(c.popularity) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map((s) => s.c);
}

// ── Operations: one per instrument, keyed by its slug ─────────────────────────────────

const numberIn = (name: string, v: unknown, min: number, max: number) => {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) throw new InputError(`${name} must be a number from ${min} to ${max}.`);
  return v;
};

export interface ScaleInput {
  /** Base size in px. Default 16. */
  base?: number;
  /** A number, or a named ratio such as "major-third". Default 1.25. */
  ratio?: number | RatioName;
  fluid?: Fluid;
}

export const scale: Operation<ScaleInput, { steps: ScaleStep[]; css: string }> = ({ base = 16, ratio = 1.25, fluid }) => {
  const r = typeof ratio === 'string' ? RATIOS[ratio] : ratio;
  if (r === undefined) throw new InputError(`ratio must be a number or one of ${Object.keys(RATIOS).join(', ')}.`);
  const b = numberIn('base', base, 8, 40);
  numberIn('ratio', r, 1.01, 2);
  if (fluid) {
    numberIn('fluid.minBase', fluid.minBase, 8, 40);
    numberIn('fluid.minRatio', fluid.minRatio, 1.01, 2);
    if (!(fluid.minViewport < fluid.maxViewport)) throw new InputError('fluid.minViewport must be below fluid.maxViewport.');
  }
  return { steps: scaleOf(b, r), css: scaleCss(b, r, fluid) };
};

export interface UnitsInput {
  value: number;
  unit: Unit;
  /** Root font size in px. Default 16. */
  root?: number;
  /** The element's own font size in px, for em and %. Default 16. */
  context?: number;
}

export const units: Operation<UnitsInput, Record<Unit, number>> = ({ value, unit, root = ROOT, context = ROOT }) => {
  if (!UNITS.includes(unit)) throw new InputError(`unit must be one of ${UNITS.join(', ')}.`);
  return convertLength(numberIn('value', value, -10000, 10000), unit, numberIn('root', root, 1, 100), numberIn('context', context, 1, 1000));
};

export interface MeasureInput {
  /** Column width in px. */
  width: number;
  /** Font size in px. */
  fontSize: number;
  /** Average character width as a fraction of the font size (widthRatio of the face). Default 0.5. */
  averageWidth?: number;
}

export const measure: Operation<MeasureInput, { characters: number; band: Band }> = ({ width, fontSize, averageWidth = 0.5 }) => {
  const characters = charactersPerLine(numberIn('width', width, 1, 10000), numberIn('fontSize', fontSize, 1, 200), numberIn('averageWidth', averageWidth, 0.1, 2));
  return { characters, band: bandOf(characters) };
};

export interface FallbackInput {
  family: string;
  font: Metrics;
  fallbackFamily: string;
  fallback: Metrics;
  category?: Category;
}

export const fallback: Operation<FallbackInput, Overrides & { css: string }> = ({ family, font, fallbackFamily, fallback: fb, category = 'sans' }) => {
  const o = overridesFor(font, fb);
  return { ...o, css: fallbackCss(family, fallbackFamily, o, category) };
};

export const operations = { scale, units, measure, fallback };
