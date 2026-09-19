import { describe, expect, it } from 'vitest';
import { InputError } from '../../operation';
import { bandOf, clampFor, convertLength, embeds, fallback, leadingFor, overridesFor, scale, scaleOf, trackingEm, units } from '.';

describe('scale', () => {
  it('multiplies the base by the ratio per step', () => {
    const steps = scaleOf(16, 1.25);
    expect(steps.find((s) => s.name === 'base')).toMatchObject({ px: 16, rem: 1 });
    expect(steps.find((s) => s.name === 'lg')!.px).toBe(20);
    expect(steps.find((s) => s.name === 'xl')!.px).toBe(25);
    expect(steps.find((s) => s.name === 'sm')!.px).toBe(12.8);
  });

  it('tightens leading as type grows', () => {
    expect(leadingFor(16)).toBe(1.5);
    expect(leadingFor(10)).toBe(1.5);
    expect(leadingFor(48)).toBe(1.17);
    expect(leadingFor(120)).toBe(1.1);
  });

  it('writes a fluid size the way clamp() and Utopia do', () => {
    // 16px at 320px wide, 20px at 1240px: slope 4/920 px per px.
    expect(clampFor(16, 20, 320, 1240)).toBe('clamp(1rem, 0.913rem + 0.4348vw, 1.25rem)');
    expect(clampFor(12, 10, 320, 1240)).toBe('clamp(0.625rem, 0.7935rem - 0.2174vw, 0.75rem)');
  });

  it('writes Tailwind-shaped custom properties', () => {
    const { css } = scale({ base: 16, ratio: 'major-third' });
    expect(css).toContain('--text-base: 1rem;');
    expect(css).toContain('--text-base--line-height: 1.5;');
    expect(css.split('\n')).toHaveLength(16);
  });

  it('refuses a ratio it does not know', () => {
    expect(() => scale({ ratio: 'tritone' as never })).toThrow(InputError);
  });
});

describe('units', () => {
  it('converts by the CSS definitions', () => {
    expect(convertLength(24, 'px')).toMatchObject({ rem: 1.5, em: 1.5, pt: 18, '%': 150 });
    expect(convertLength(12, 'pt')).toMatchObject({ px: 16, rem: 1 });
    expect(convertLength(1.5, 'em', 16, 20)).toMatchObject({ px: 30, rem: 1.875 });
    expect(units({ value: 18, unit: 'px', root: 18 }).rem).toBe(1);
  });

  it('turns design-tool tracking into letter-spacing', () => {
    expect(trackingEm(-2, 'percent')).toBe(-0.02);
    expect(trackingEm(50, 'thousandths')).toBe(0.05);
    expect(trackingEm(1, 'px', 20)).toBe(0.05);
  });
});

describe('measure', () => {
  it('bands line length as Bringhurst and WCAG do', () => {
    expect(bandOf(40)).toBe('short');
    expect(bandOf(66)).toBe('comfortable');
    expect(bandOf(78)).toBe('long');
    expect(bandOf(95)).toBe('too long');
  });
});

describe('fallback', () => {
  const inter = { unitsPerEm: 2048, ascent: 1984, descent: -494, lineGap: 0, capHeight: 1490, xHeight: 1118, xWidthAvg: 978 };

  it('leaves a face measured against itself unchanged', () => {
    expect(overridesFor(inter, inter)).toEqual({ sizeAdjust: 100, ascentOverride: 96.88, descentOverride: 24.12, lineGapOverride: 0 });
  });

  it('scales a narrower fallback up to the webfont width', () => {
    const narrower = { ...inter, xWidthAvg: 900 };
    const o = overridesFor(inter, narrower);
    expect(o.sizeAdjust).toBeCloseTo((978 / 900) * 100, 1);
    expect(o.ascentOverride).toBeLessThan(96.88);
  });

  it('writes the @font-face and the stack', () => {
    const { css } = fallback({ family: 'Inter', font: inter, fallbackFamily: 'Arial', fallback: { ...inter, xWidthAvg: 904 } });
    expect(css).toContain('src: local("Arial");');
    expect(css).toContain('font-family: "Inter", "Inter Fallback", sans-serif;');
  });
});

describe('embeds', () => {
  it('writes Google embeds for fixed and variable faces', () => {
    expect(embeds({ id: 'lora', family: 'Lora', weights: [400, 500, 600, 700], italic: true }, [400, 700]).google).toBe(
      '<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">',
    );
    expect(embeds({ id: 'inter', family: 'Inter', weights: [100, 900], variable: true }).google).toContain('family=Inter:wght@100..900');
    expect(embeds({ id: 'inter', family: 'Inter', weights: [100, 900], variable: true }).npm).toBe('npm install @fontsource-variable/inter');
  });
});
