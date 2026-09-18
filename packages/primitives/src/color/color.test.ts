import { describe, expect, it } from 'vitest';
import { InputError } from '../operation';
import { contrast, fixText, fromHex, grade, parseColor, ratio, ratioText } from '.';

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
    expect(fix.direction).toBe('darken');
    expect(fix.color.c).toBe(a.c);
    expect(fix.color.h).toBe(a.h);
    expect(fix.ratio).toBeGreaterThanOrEqual(4.5);
    // It is the first 0.02 step that passes.
    expect(ratio({ ...a, l: fix.color.l + 0.02 }, b)).toBeLessThan(4.5);
  });

  it('lightens text on a dark ground', () => {
    const fix = fixText({ l: 0.45, c: 0.05, h: 250 }, { l: 0.25, c: 0.02, h: 250 })!;
    expect(fix.direction).toBe('lighten');
    expect(fix.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('offers nothing when the pair already passes', () => {
    expect(fixText({ l: 0.55, c: 0.18, h: 25 }, { l: 0.95, c: 0.03, h: 250 })).toBeNull();
  });
});

describe('parseColor', () => {
  it('reads every CSS form an agent is likely to send', () => {
    const red = parseColor('#ff0000');
    for (const form of ['ff0000', 'f00', 'rgb(255 0 0)', 'hsl(0 100% 50%)', 'red', 'oklch(0.628 0.2577 29.23)']) {
      const c = parseColor(form);
      expect(c.l).toBeCloseTo(red.l, 2);
      expect(c.h).toBeCloseTo(red.h, 0);
    }
  });

  it('refuses what is not a color, with a message a person can act on', () => {
    expect(() => parseColor('blurple')).toThrow(InputError);
    expect(() => parseColor('blurple')).toThrow(/Not a color: "blurple"/);
  });
});

describe('the contrast operation', () => {
  it('takes and returns plain JSON', () => {
    const input = { text: '#999999', background: 'white' };
    const result = contrast(input);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
    expect(result.text.hex).toBe('#999999');
    expect(result.background.hex).toBe('#ffffff');
    expect(result.ratio).toBe(2.84);
    expect(result.grade).toBe('Fails');
    expect(result.passes).toEqual({ bodyAA: false, largeAA: false, bodyAAA: false, largeAAA: false });
    expect(result.fix).toMatchObject({ direction: 'darken', text: { hex: '#757575' } });
    expect(result.fix!.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('returns no fix for a passing pair', () => {
    expect(contrast({ text: 'black', background: 'white' })).toMatchObject({ ratio: 21, grade: 'AAA', fix: null });
  });
});
