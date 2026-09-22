import { describe, expect, it } from 'vitest';
import { parseNumberField } from './number-field';
import noiseControls from '../../instruments/noise/NoiseControls.svelte?raw';
import randomSeedControl from '../../instruments/random/SeedControl.svelte?raw';
import diceTool from '../../instruments/random/dice/Tool.svelte?raw';
import rangeTool from '../../instruments/random/range/Tool.svelte?raw';
import ratioDimensions from '../../instruments/ratio/DimensionControls.svelte?raw';
import aspectTool from '../../instruments/ratio/aspect/Tool.svelte?raw';

describe('number field parsing', () => {
  it('holds fractional integer drafts instead of propagating them', () => {
    expect(parseNumberField('1.5', 0, 100, true)).toBeNull();
    expect(parseNumberField('1,5', 0, 100, true)).toBeNull();
    expect(parseNumberField('1.5', 0, 100, false)).toBe(1.5);
    expect(parseNumberField('2', 0, 100, true)).toBe(2);
  });
});

describe('integer domain controls', () => {
  it('opts every NumberField for seeds, dice, ranges and ratio dimensions into integer validation', () => {
    for (const source of [noiseControls, randomSeedControl, diceTool, rangeTool, ratioDimensions, aspectTool]) {
      const fields = source.match(/<NumberField\b[\s\S]*?\/>/g) ?? [];
      expect(fields.length).toBeGreaterThan(0);
      for (const field of fields) expect(field).toMatch(/\binteger\b/);
    }
  });
});
