import { describe, expect, it } from 'vitest';
import { hex } from '@duskresearch/primitives/color';
import { serialize } from './state';
import { defaults, parse } from './defaults';

describe('color url state', () => {
  it('round-trips through hex within display precision', () => {
    const q = serialize(defaults);
    expect(q).toMatch(/^a=[0-9a-f]{6}&b=[0-9a-f]{6}$/);
    const back = parse(new URLSearchParams(q));
    expect(hex(back.a)).toBe(hex(defaults.a));
    expect(hex(back.b)).toBe(hex(defaults.b));
    expect(Math.abs(back.a.l - defaults.a.l)).toBeLessThan(0.005);
    // The brief's example URL for the default pair.
    expect(q).toBe('a=c53637&b=e0f1ff');
  });

  it('keeps out-of-gamut colors as an l,c,h triple', () => {
    const vivid = { a: { l: 0.7, c: 0.35, h: 150 }, b: defaults.b };
    const q = serialize(vivid);
    expect(q).toMatch(/^a=0\.7,0\.35,150&b=/);
    expect(parse(new URLSearchParams(q)).a).toEqual(vivid.a);
  });

  it('falls back to defaults on junk', () => {
    expect(parse(new URLSearchParams('a=zzz&b='))).toEqual(defaults);
  });
});
