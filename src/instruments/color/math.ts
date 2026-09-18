// Color math for every Color instrument. culori does the conversions and gamut mapping;
// nothing here is hand-rolled.
import {
  useMode, modeOklch, modeOklab, modeRgb, modeLrgb,
  formatHex, parseHex, toGamut, differenceEuclidean, wcagContrast, wcagLuminance,
  type Oklch, type Rgb,
} from 'culori/fn';

const toOklch = useMode(modeOklch);
useMode(modeOklab);
useMode(modeRgb);
useMode(modeLrgb);

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
  verb: 'Darken' | 'Lighten';
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
      if (r >= target) return { color, hex: hex(color), ratio: r, verb: dir < 0 ? 'Darken' : 'Lighten' };
      if (l === 0 || l === 1) break;
    }
  }
  return null;
}
