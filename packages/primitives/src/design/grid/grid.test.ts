import { describe, expect, it } from 'vitest';
import { InputError } from '../../operation';
import { baseline, breakpoints, columns, layout, operations, type BreakpointsInput } from './index';

const shared = { cols: 12, gap: 24, margin: 40, max: 1280 };

describe('grid operations', () => {
  it('exports all four JSON operations', () => expect(Object.keys(operations)).toEqual(['columns', 'breakpoints', 'baseline', 'layout']));
  it('computes the default 78px track and honors max-width', () => {
    const result = columns({ ...shared, width: 1280 });
    expect(result).toMatchObject({ containerWidth: 1280, contentWidth: 1200, totalGap: 264, trackWidth: 78, fits: true, overflow: 0 });
    expect(columns({ ...shared, width: 2000 }).containerWidth).toBe(1280);
    expect(result.css).toContain('box-sizing: border-box;');
    expect(result.css).toContain('repeat(12, minmax(0, 1fr))');
  });
  it('reports gap overflow without changing the CSS or column count', () => {
    const result = columns({ cols: 24, gap: 64, margin: 96, max: 320, width: 240 });
    expect(result).toMatchObject({ fits: false, trackWidth: 0, overflow: 1424 });
    expect(result.css).toContain('repeat(24, minmax(0, 1fr))');
  });
  it('rejects invalid, fractional, and nonfinite values', () => {
    expect(() => columns({ ...shared, cols: 0, width: 1280 })).toThrow(InputError);
    expect(() => columns({ ...shared, gap: NaN, width: 1280 })).toThrow(InputError);
    expect(() => columns({ ...shared, width: 240.5 })).toThrow(InputError);
  });
});

const bp: BreakpointsInput = { ...shared, width: 900, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 };
describe('breakpoints', () => {
  it('selects each boundary at threshold minus, exact, and plus one', () => {
    for (const [threshold, below, at] of [[640, 'base', 'sm'], [768, 'sm', 'md'], [1024, 'md', 'lg'], [1280, 'lg', 'xl'], [1536, 'xl', '2xl']] as const) {
      expect(breakpoints({ ...bp, width: threshold - 1 }).active.name).toBe(below);
      expect(breakpoints({ ...bp, width: threshold }).active.name).toBe(at);
      expect(breakpoints({ ...bp, width: threshold + 1 }).active.name).toBe(at);
    }
  });
  it('exports the visible column policy and media queries', () => {
    const result = breakpoints(bp);
    expect(result.ranges.map((r) => r.cols)).toEqual([1, 2, 4, 6, 12, 12]);
    expect(result.css).toContain('@media (min-width: 768px)');
    expect(result.css).toContain('repeat(4, minmax(0, 1fr))');
  });
  it('rejects unordered widths', () => expect(() => breakpoints({ ...bp, md: 640 })).toThrow(InputError));
});

describe('baseline', () => {
  it('recognizes line-box rhythm and recommendation', () => {
    expect(baseline({ step: 8, size: 16, leading: 24, offset: 0 })).toMatchObject({ aligned: true, recommended: 24, driftPerLine: 0, stepCss: '8px' });
    expect(baseline({ step: 8, size: 16, leading: 24, offset: 1 }).aligned).toBe(false);
    expect(baseline({ step: 8, size: 16, leading: 23, offset: 0 })).toMatchObject({ aligned: false, recommended: 24, driftPerLine: -1 });
    expect(baseline({ step: 8, size: 16, leading: 25, offset: 0 })).toMatchObject({ aligned: false, recommended: 24, driftPerLine: 1 });
    expect(baseline({ step: 8, size: 16, leading: 15, offset: 0 })).toMatchObject({ aligned: false, recommended: 16, driftPerLine: -1 });
    expect(baseline({ step: 24, size: 16, leading: 64, offset: 0 })).toMatchObject({ recommended: 48, driftPerLine: 16 });
  });
  it('rejects an offset outside the current step', () => expect(() => baseline({ step: 8, size: 16, leading: 24, offset: 8 })).toThrow(InputError));
});

describe('layout', () => {
  const rectangle = (rows: string[][], region: string) => {
    const cells = rows.flatMap((row, y) => row.map((name, x) => ({ name, x, y }))).filter((c) => c.name === region);
    const xs = cells.map((c) => c.x), ys = cells.map((c) => c.y);
    for (let y = Math.min(...ys); y <= Math.max(...ys); y++) for (let x = Math.min(...xs); x <= Math.max(...xs); x++) expect(rows[y][x]).toBe(region);
  };
  it.each(['sidebar', 'holy-grail', 'dashboard'] as const)('%s has rectangular areas and complete mobile order', (preset) => {
    const result = layout({ ...shared, preset, width: 1280, collapse: 768, sidebar: 240 });
    for (const region of result.regions) rectangle(result.desktopAreas, region);
    expect(result.mobileAreas.flat()).toEqual(result.regions);
    expect(result.html).toContain('<main class="main">');
    expect(result.css).toContain('@media (min-width: 768px)');
  });
  it('selects the same collapse boundary as generated CSS', () => {
    expect(layout({ ...shared, preset: 'sidebar', width: 767, collapse: 768, sidebar: 240 }).collapsed).toBe(true);
    expect(layout({ ...shared, preset: 'sidebar', width: 768, collapse: 768, sidebar: 240 }).collapsed).toBe(false);
  });
  it('reports fixed-sidebar overflow without changing the CSS', () => {
    const result = layout({ cols: 12, gap: 64, margin: 96, max: 320, preset: 'holy-grail', width: 320, collapse: 320, sidebar: 400 });
    expect(result).toMatchObject({ fits: false, overflow: 800 });
    expect(result.css).toContain('400px minmax(0, 1fr) 400px');
  });
  it('does not expose mutable preset templates across calls', () => {
    const input = { ...shared, preset: 'sidebar' as const, width: 1280, collapse: 768, sidebar: 240 };
    const first = layout(input);
    first.desktopAreas[0][0] = 'broken';
    first.mobileAreas[0][0] = 'broken';
    const second = layout(input);
    expect(second.desktopAreas[0][0]).toBe('header');
    expect(second.mobileAreas[0][0]).toBe('header');
    expect(second.css).toContain('"header header"');
  });
});
