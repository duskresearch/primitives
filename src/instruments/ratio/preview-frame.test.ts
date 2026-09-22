import { describe, expect, it } from 'vitest';
import { fitPreviewFrame } from './preview-frame';
import aspectTool from './aspect/Tool.svelte?raw';
import proportionTool from './proportion/Tool.svelte?raw';

describe('ratio preview fitting', () => {
  it('fits square, portrait, and extreme ratios without changing their shape', () => {
    for (const [width, height] of [[1, 1], [4, 5], [1, 100], [100, 1]]) {
      const frame = fitPreviewFrame(width, height, 280, 230);
      expect(frame.width).toBeLessThanOrEqual(280);
      expect(frame.height).toBeLessThanOrEqual(230);
      expect(frame.width / frame.height).toBeCloseTo(width / height, 8);
    }
    expect(fitPreviewFrame(1, 1, 280, 230)).toEqual({ width: 230, height: 230 });
  });
});

it('uses fitted width in both previews without height rules that break the ratio', () => {
  for (const source of [aspectTool, proportionTool]) {
    expect(source).toContain('fitPreviewFrame(');
    expect(source).toContain('width:min(100%,${frame!.width}px)');
    expect(source).not.toMatch(/(?:min|max)-height:\s*\d+px/);
    expect(source).not.toMatch(/\.frame\{[^}]*border:/);
    expect(source).toMatch(/\.frame span\{position:absolute/);
  }
});
