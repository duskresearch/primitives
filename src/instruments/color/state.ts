// The Color primitive's shared state: two colors, A and B, carried by every Color
// instrument in the URL. Hex where it stands for the color, an l,c,h triple where
// the color lies well outside sRGB.
// Client-safe: defaults and parsing from the catalogue live in ./defaults.ts (server side).
import { fromHex, hex, hexSafe, round, type Lch } from '@duskresearch/primitives/design/color';

export interface ColorState {
  a: Lch;
  b: Lch;
}

export function decode(value: string | null, fallback: Lch): Lch {
  if (!value) return fallback;
  const fromTriple = /^([\d.]+),([\d.]+),([\d.]+)$/.exec(value);
  if (fromTriple) {
    const [l, c, h] = fromTriple.slice(1).map(Number);
    if ([l, c, h].every(Number.isFinite)) return { l: Math.min(1, l), c: Math.min(0.4, c), h: h % 360 };
  }
  return fromHex(value) ?? fallback;
}

const encode = (c: Lch) => (hexSafe(c) ? hex(c).slice(1) : `${round(c.l, 3)},${round(c.c, 3)},${round(c.h, 1)}`);

export const serialize = (s: ColorState) => `a=${encode(s.a)}&b=${encode(s.b)}`;

/** The shared colors plus an instrument's own settings, e.g. `rule=triadic`. */
export const serializeWith = (s: ColorState, own: Record<string, string | number>) =>
  [serialize(s), ...Object.entries(own).map(([k, v]) => `${k}=${v}`)].join('&');
