import catalogue from '@/data/catalogue.json';
import { decode, type ColorState } from './state';
import type { Lch } from '@duskresearch/primitives/design/color';

const triple = (s: string): Lch => {
  const [l, c, h] = s.match(/[\d.]+/g)!.map(Number);
  return { l, c, h };
};

const spec = catalogue.primitives.find((p) => p.slug === 'color')!.state as Record<'a' | 'b', string>;
export const defaults: ColorState = { a: triple(spec.a), b: triple(spec.b) };

export const parse = (params: URLSearchParams): ColorState => ({
  a: decode(params.get('a'), defaults.a),
  b: decode(params.get('b'), defaults.b),
});

/** An instrument's own setting from the URL, when it is one it knows. */
export const oneOf = <T extends string>(value: string | null, options: readonly T[], fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback;

/** A whole percentage from the URL, 0 to 100. */
export const percent = (value: string | null, fallback: number) => {
  const n = Number(value);
  return value !== null && value !== '' && Number.isFinite(n) ? Math.round(Math.min(100, Math.max(0, n))) : fallback;
};
