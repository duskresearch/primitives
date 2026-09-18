// Pick, Scale, Harmony, Convert and Blend, checked against published values where there are
// some: CSS Color 4's example conversions, CSS Color 5's color-mix() examples, and the blend
// formulas of W3C Compositing and Blending Level 1.
import { describe, expect, it } from 'vitest';
import { InputError } from '../../operation';
import { blend, blendChannel, convert, harmony, parseColor, pick, scale, SCALE_STEP } from '.';

describe('convert', () => {
  it('writes red the way CSS Color 4 does', () => {
    const red = convert({ color: '#ff0000' });
    expect(red).toMatchObject({ hex: '#ff0000', rgb: 'rgb(255 0 0)', hsl: 'hsl(0 100% 50%)', gamut: 'srgb', named: { name: 'red', exact: true } });
    // CSS Color 4 gives red as oklch(62.8% 0.25768 29.2339).
    expect(red.oklch).toBe('oklch(0.628 0.258 29.2)');
    // sRGB red inside Display P3: color(display-p3 0.9175 0.2003 0.1386).
    const [r, g, b] = red.p3.match(/[\d.]+/g)!.slice(1).map(Number);
    expect(r).toBeCloseTo(0.9175, 3);
    expect(g).toBeCloseTo(0.2003, 3);
    expect(b).toBeCloseTo(0.1386, 3);
  });

  it('agrees across hex, rgb() and hsl() for a named color', () => {
    expect(convert({ color: 'rebeccapurple' })).toMatchObject({
      hex: '#663399',
      rgb: 'rgb(102 51 153)',
      hsl: 'hsl(270 50% 40%)',
      named: { name: 'rebeccapurple', exact: true },
    });
  });

  it('names the nearest CSS color and says when it is not exact', () => {
    const near = convert({ color: '#c53637' }).named;
    expect(near.exact).toBe(false);
    expect(near.name).toMatch(/^[a-z]+$/);
  });

  it('knows a color only wide-gamut screens can show', () => {
    const p3red = convert({ color: 'color(display-p3 1 0 0)' });
    expect(p3red.gamut).toBe('p3');
    expect(p3red.p3).toBe('color(display-p3 1 0 0)');
    expect(p3red.hex).toMatch(/^#[0-9a-f]{6}$/);
    expect(convert({ color: 'oklch(0.7 0.4 150)' }).gamut).toBe('wider');
  });

  it('writes a gray with hue 0, not a leftover angle', () => {
    expect(convert({ color: '#808080' }).oklch).toMatch(/^oklch\([\d.]+ 0 0\)$/);
  });
});

describe('pick', () => {
  it('returns the chosen color as CSS writes it', () => {
    expect(pick({ l: 0.55, c: 0.18, h: 25 })).toMatchObject({ oklch: 'oklch(0.55 0.18 25)', gamut: 'srgb' });
    expect(pick({ l: 0.5, c: 0.1, h: -90 }).oklch).toBe('oklch(0.5 0.1 270)');
  });

  it('says where a color can be shown', () => {
    expect(pick({ l: 0.7, c: 0.4, h: 150 }).gamut).toBe('wider');
  });

  it('refuses out-of-range numbers', () => {
    expect(() => pick({ l: 2, c: 0.1, h: 0 })).toThrow(InputError);
    expect(() => pick({ l: 0.5, c: 0.1, h: Number.NaN })).toThrow(/h must be a number/);
  });
});

describe('scale', () => {
  const base = '#c53637';
  const result = scale({ color: base });

  it('puts the base color exactly on one of seven steps', () => {
    expect(result.steps).toHaveLength(7);
    const on = result.steps.filter((s) => s.base);
    expect(on).toHaveLength(1);
    expect(on[0].hex).toBe(base);
    expect(on[0].name).toBe('500');
  });

  it('spaces the steps evenly in lightness and keeps the hue', () => {
    const ls = result.steps.map((s) => s.oklch.l);
    ls.slice(1).forEach((l, i) => expect(ls[i] - l).toBeCloseTo(SCALE_STEP, 3));
    const h = parseColor(base).h;
    result.steps.forEach((s) => expect(s.oklch.h).toBeCloseTo(h, 1));
  });

  it('keeps the ladder on screen for very light and very dark bases', () => {
    for (const color of ['white', 'black', '#f8f5ee', '#101010']) {
      const steps = scale({ color }).steps;
      steps.forEach((s) => {
        expect(s.oklch.l).toBeGreaterThanOrEqual(0);
        expect(s.oklch.l).toBeLessThanOrEqual(1);
      });
      expect(steps.filter((s) => s.base)).toHaveLength(1);
    }
  });

  it('keeps every step inside sRGB, so its hex and oklch() agree', () => {
    for (const step of result.steps) expect(convert({ color: `oklch(${step.oklch.l} ${step.oklch.c} ${step.oklch.h})` }).gamut).toBe('srgb');
    expect(result.css).not.toMatch(/oklch/);
  });

  it('writes one custom property per step', () => {
    const lines = result.css.split('\n');
    expect(lines).toHaveLength(7);
    expect(lines[4]).toBe(`--color-500: ${base};`);
  });
});

describe('harmony', () => {
  it('turns the base around the hue circle, keeping lightness and chroma', () => {
    const { colors } = harmony({ color: '#c53637', rule: 'triadic' });
    expect(colors.map((c) => c.offset)).toEqual([0, 120, 240]);
    const [base, second, third] = colors.map((c) => c.oklch);
    expect(second.h).toBeCloseTo((base.h + 120) % 360, 1);
    expect(third.h).toBeCloseTo((base.h + 240) % 360, 1);
    expect(second.l).toBe(base.l);
    // Green and blue cannot hold a strong red's chroma at its lightness inside sRGB.
    expect(second.c).toBeLessThanOrEqual(base.c);
  });

  it('writes the palette as colors sRGB can show, matching the swatches', () => {
    const { colors } = harmony({ color: '#c53637', rule: 'triadic' });
    for (const c of colors) expect(convert({ color: `oklch(${c.oklch.l} ${c.oklch.c} ${c.oklch.h})` }).hex).toBe(c.hex);
  });

  it('gives five analogous colors by default, the base in the middle', () => {
    const { rule, colors } = harmony({ color: 'teal' });
    expect(rule).toBe('analogous');
    expect(colors.map((c) => c.offset)).toEqual([-60, -30, 0, 30, 60]);
  });

  it('refuses an unknown rule', () => {
    expect(() => harmony({ color: 'teal', rule: 'pentagon' as never })).toThrow(/rule must be one of/);
  });
});

describe('blend', () => {
  it('composites opacity in sRGB, like color-mix() in sRGB (CSS Color 5)', () => {
    // color-mix(in srgb, red 50%, blue) is rgb(50% 0% 50%).
    expect(blend({ top: 'red', bottom: 'blue', mode: 'opacity', amount: 0.5 }).result.hex).toBe('#800080');
  });

  it('mixes in OKLCH', () => {
    // Halfway between black and white in OKLCH is lightness 0.5: #636363.
    expect(blend({ top: 'white', bottom: 'black', mode: 'mix', amount: 0.5 }).result.hex).toBe('#636363');
  });

  it("lets a gray take the other color's hue, as CSS does", () => {
    const blue = parseColor('blue');
    const result = blend({ top: 'white', bottom: 'blue', mode: 'mix', amount: 0.5 }).result;
    // Mapping the light blue into sRGB moves its hue by a degree or so; a gray treated as
    // hue 0 would land near 310, a purple.
    expect(Math.abs(result.oklch.h - blue.h)).toBeLessThan(3);
  });

  it('multiplies and screens as the spec defines', () => {
    expect(blend({ top: 'red', bottom: 'lime', mode: 'multiply', amount: 1 }).result.hex).toBe('#000000');
    expect(blend({ top: 'red', bottom: 'lime', mode: 'screen', amount: 1 }).result.hex).toBe('#ffff00');
    expect(blend({ top: 'white', bottom: '#c53637', mode: 'multiply', amount: 1 }).result.hex).toBe('#c53637');
    expect(blend({ top: 'black', bottom: '#c53637', mode: 'screen', amount: 1 }).result.hex).toBe('#c53637');
  });

  it('overlays by the spec formula: hard light with the layers swapped', () => {
    // Overlay(cb, cs) = HardLight(cs, cb): multiply below a half, screen above.
    expect(blendChannel.overlay(0.25, 0.8)).toBeCloseTo(0.4, 10);
    expect(blendChannel.overlay(0.75, 0.8)).toBeCloseTo(0.9, 10);
    // White over white stays white (culori's overlay returns 0 here).
    expect(blendChannel.overlay(1, 1)).toBe(1);
    expect(blendChannel.overlay(0.5, 0.3)).toBeCloseTo(0.3, 10);
  });

  it('fades the layer with amount', () => {
    expect(blend({ top: 'red', bottom: 'lime', mode: 'multiply', amount: 0 }).result.hex).toBe('#00ff00');
  });

  it('writes the CSS that makes the result', () => {
    expect(blend({ top: 'red', bottom: 'blue' }).css).toBe('color-mix(in oklch, #ff0000 50%, #0000ff)');
    expect(blend({ top: 'red', bottom: 'blue', mode: 'opacity', amount: 0.25 }).css).toBe('color-mix(in srgb, #ff0000 25%, #0000ff)');
    expect(blend({ top: 'red', bottom: 'blue', mode: 'multiply', amount: 0.5 }).css).toBe('mix-blend-mode: multiply; opacity: 0.5;');
    expect(blend({ top: 'red', bottom: 'blue', mode: 'screen', amount: 1 }).css).toBe('mix-blend-mode: screen;');
  });

  it('refuses a bad mode or amount', () => {
    expect(() => blend({ top: 'red', bottom: 'blue', mode: 'dodge' as never })).toThrow(/mode must be one of/);
    expect(() => blend({ top: 'red', bottom: 'blue', amount: 2 })).toThrow(/amount must be a number from 0 to 1/);
  });

  it('takes and returns plain JSON', () => {
    const result = blend({ top: '#c53637', bottom: '#e0f1ff', mode: 'overlay', amount: 0.6 });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });
});
