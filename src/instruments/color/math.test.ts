import { describe, expect, it } from 'vitest';
import { fixText, fromHex, grade, hex, ratio, ratioText } from './math';
import { serialize } from './state';
import { defaults, parse } from './defaults';

describe('contrast', () => {
  it('matches WCAG reference values', () => {
    const black = fromHex('000000')!;
    const white = fromHex('ffffff')!;
    expect(ratio(black, white)).toBeCloseTo(21, 1);
    expect(ratio(white, white)).toBeCloseTo(1, 5);
    // ink-2 on paper, stated in the brief as about 4.6 : 1
    expect(ratio(fromHex('6b6a63')!, fromHex('f4f1ea')!)).toBeCloseTo(4.9, 0);
  });

  it('never rounds a failing ratio up to a pass', () => {
    expect(ratioText(4.4999)).toBe('4.49');
    expect(ratioText(4.5)).toBe('4.50');
  });

  it('grades by WCAG thresholds', () => {
    expect(grade(7)).toBe('AAA');
    expect(grade(4.5)).toBe('AA');
    expect(grade(3.2)).toBe('AA large only');
    expect(grade(2.9)).toBe('Fails');
  });
});

describe('fix suggestion', () => {
  it('darkens text on a light ground, keeping hue and chroma', () => {
    const a = { l: 0.7, c: 0.12, h: 25 };
    const b = { l: 0.95, c: 0.03, h: 250 };
    const fix = fixText(a, b)!;
    expect(fix.verb).toBe('Darken');
    expect(fix.color.c).toBe(a.c);
    expect(fix.color.h).toBe(a.h);
    expect(fix.ratio).toBeGreaterThanOrEqual(4.5);
    // It is the first 0.02 step that passes.
    expect(ratio({ ...a, l: fix.color.l + 0.02 }, b)).toBeLessThan(4.5);
  });

  it('lightens text on a dark ground', () => {
    const fix = fixText({ l: 0.45, c: 0.05, h: 250 }, { l: 0.25, c: 0.02, h: 250 })!;
    expect(fix.verb).toBe('Lighten');
    expect(fix.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('offers nothing when the pair already passes', () => {
    expect(fixText(defaults.a, defaults.b)).toBeNull();
  });
});

describe('url state', () => {
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
