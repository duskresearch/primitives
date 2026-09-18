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
