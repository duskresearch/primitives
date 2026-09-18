// Color: the logic of every Color instrument. culori does the conversions and gamut
// mapping; nothing here is hand-rolled. Building blocks first, operations (JSON in, JSON
// out, see ../operation.ts) at the end.
import {
  useMode, modeOklch, modeOklab, modeRgb, modeLrgb, modeHsl,
  formatHex, parseHex, parse as parseCss, toGamut, differenceEuclidean, wcagContrast, wcagLuminance,
  type Oklch, type Rgb,
} from 'culori/fn';
import { InputError, type Operation } from '../operation';

const toOklch = useMode(modeOklch);
useMode(modeOklab);
useMode(modeRgb);
useMode(modeLrgb);
useMode(modeHsl);

/** An OKLCH color as the sliders hold it. */
export interface Lch {
  l: number;
  c: number;
  h: number;
}

const ok = (c: Lch): Oklch => ({ mode: 'oklch', l: c.l, c: c.c, h: c.h });
const mapToSrgb = toGamut('rgb', 'oklch');
const distance = differenceEuclidean('oklab');

/** The sRGB color actually shown: out-of-gamut colors are mapped in, keeping lightness and hue. */
export const displayed = (c: Lch): Rgb => mapToSrgb(ok(c)) as Rgb;
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

/** Any CSS color: hex (the # is optional), rgb(), hsl(), oklch() or a named color. */
export type ColorInput = string;

export function parseColor(input: ColorInput): Lch {
  const text = typeof input === 'string' ? input.trim() : '';
  const parsed = parseCss(/^[0-9a-f]{3,8}$/i.test(text) ? `#${text}` : text);
  if (!parsed) throw new InputError(`Not a color: "${input}". Use hex, rgb(), hsl(), oklch() or a CSS color name.`);
  const o = toOklch(parsed);
  return { l: o.l, c: o.c ?? 0, h: o.h ?? 0 };
}

/** A color as operations return it: the sRGB hex that is shown, and its OKLCH. */
export interface ColorOut {
  hex: string;
  oklch: Lch;
}

const out = (c: Lch): ColorOut => ({ hex: hex(c), oklch: { l: round(c.l, 4), c: round(c.c, 4), h: round(c.h, 2) } });

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

export const operations = { contrast };
