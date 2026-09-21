import { describe, expect, it } from 'vitest';
import { defaults, numberIn, parse, parseBaselineOwn, parseBreakpointsOwn, parseColumnsOwn, parseLayoutOwn } from './defaults';
import { clampBaselineOffset, normalizeBaselineStep, serializeWith } from './state';
import catalogue from '../../data/catalogue.json';

describe('Grid URL state', () => {
  it('has the catalogue defaults', () => {
    const state = catalogue.primitives.find((primitive) => primitive.slug === 'grid')!.state!;
    expect(defaults).toEqual(Object.fromEntries(Object.entries(state).map(([key, value]) => [key, Number(value)])));
    expect(parse(new URLSearchParams())).toEqual(defaults);
  });
  it('defaults malformed and blank values, clamps finite values consistently', () => {
    expect(parse(new URLSearchParams('cols=&gap=NaN&margin=999&max=319'))).toEqual({ cols: 12, gap: 24, margin: 96, max: 320 });
    expect(numberIn('12.6', 1, 24, 12)).toBe(13);
  });
  it('encodes and round trips shared plus own settings', () => {
    const state = { cols: 5, gap: 18, margin: 20, max: 960 };
    const own = { width: 777, preset: 'holy-grail' };
    const q = new URLSearchParams(serializeWith(state, own));
    expect(parse(q)).toEqual(state);
    expect(parseColumnsOwn(q).width).toBe(777);
    expect(parseLayoutOwn(q).preset).toBe('holy-grail');
  });
  it('falls back unordered breakpoint sets together and preserves width', () => {
    expect(parseBreakpointsOwn(new URLSearchParams('width=700&sm=800&md=700'))).toEqual({ width: 700, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 });
  });
  it('parses all sibling settings', () => {
    expect(parseBaselineOwn(new URLSearchParams('step=6&offset=99'))).toMatchObject({ step: 6, offset: 5 });
    expect(parseLayoutOwn(new URLSearchParams('preset=bad&collapse=500&sidebar=300'))).toMatchObject({ preset: 'sidebar', collapse: 500, sidebar: 300 });
  });
  it('clamps the Baseline overlay phase to a changed step', () => {
    expect(clampBaselineOffset(7, 4)).toBe(3);
    expect(clampBaselineOffset(2, 8)).toBe(2);
  });
  it('normalizes a typed fractional Baseline step before the operation sees it', () => {
    expect(normalizeBaselineStep(8.5)).toBe(9);
    expect(normalizeBaselineStep(2.2)).toBe(2);
    expect(normalizeBaselineStep(23.8)).toBe(24);
  });
});
