import { describe, expect, it } from 'vitest';
import { primitives, getPrimitive } from './catalogue';
import { logoPixelSvg, logoShapes, logoSvg, tileSvg } from './logo';
import { markSvg } from './mark-svg';

describe('the Primitives mark', () => {
  it('draws the square and the quadrant divider with the brief geometry', () => {
    expect(logoShapes(16)).toBe('<rect x="1.08" y="1.08" width="21.84" height="21.84"/><path d="M12 1.08V12H1.08"/>');
    expect(logoSvg({ size: 16 })).toContain('stroke-width="2.16" stroke-linecap="square" stroke-linejoin="miter"');
    expect(logoSvg({ size: 16 })).toContain('fill="none"');
  });

  it('drops the divider below 12 px', () => {
    expect(logoShapes(11)).not.toContain('<path');
    expect(logoPixelSvg(11).match(/<rect/g)).toHaveLength(4);
  });

  it('hints small rasters to whole pixels, centered when the stroke allows', () => {
    expect(logoPixelSvg(16)).toContain('<rect x="7" y="0" width="1" height="8"/>');
    expect(logoPixelSvg(48)).toContain('<rect x="22" y="0" width="4" height="26"/>');
  });

  it('puts the mark at half the tile', () => {
    expect(tileSvg({ size: 180, background: '#fff', color: '#000' })).toContain('translate(45 45) scale(3.75)');
  });
});

describe('primitive marks as SVG', () => {
  it('converts every catalogue mark', () => {
    for (const p of primitives) expect(() => markSvg(p, 200)).not.toThrow();
  });

  it('keeps colors out of oklch for the rasterizer', () => {
    expect(markSvg(getPrimitive('color'), 100).svg).not.toContain('oklch');
  });

  it('draws unshipped marks at 60% and reports what a mark covers', () => {
    expect(markSvg(getPrimitive('space'), 100).svg).toContain('opacity="0.6"');
    const { bounds } = markSvg(getPrimitive('color'), 100);
    // Two 0.8em discs offset by ±0.15em spill 0.05em past each side of the box.
    expect(bounds.x0).toBeCloseTo(-5);
    expect(bounds.x1).toBeCloseTo(105);
  });

  it('leaves the Type letter to the caller', () => {
    expect(markSvg(getPrimitive('type'), 100).letter).toEqual({ text: 'a', color: '#1a1a17' });
  });
});
