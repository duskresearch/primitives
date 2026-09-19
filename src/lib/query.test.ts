import { describe, expect, it } from 'vitest';
import { withoutDefaults } from './query';

describe('withoutDefaults', () => {
  it('keeps only what changed, as written', () => {
    expect(withoutDefaults('base=16&ratio=1.618&text=Sphinx%20of&pins=inter,lora', 'base=16&ratio=1.25&text=Sphinx%20of&pins=')).toBe('ratio=1.618&pins=inter,lora');
  });
  it('is empty at the defaults', () => {
    expect(withoutDefaults('a=1&b=2', 'b=2&a=1')).toBe('');
    expect(withoutDefaults('', 'a=1')).toBe('');
  });
});
