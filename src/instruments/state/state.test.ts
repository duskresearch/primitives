import { describe, expect, it } from 'vitest';
import { machine } from '@duskresearch/primitives/design/state';
import { defaults, exportOwn, parse, serializeWith } from './state';

describe('State URL contract', () => {
  it('roundtrips full schema and current state across siblings', () => {
    const q = new URLSearchParams(serializeWith({ ...defaults, current: 'loading' }, { target: 'js' }));
    expect(parse(q)).toEqual({ ...defaults, current: 'loading' });
    expect(exportOwn(q).target).toBe('js');
    expect(machine(parse(q).schema, parse(q).current).current).toBe('loading');
  });
  it('preserves invalid drafts and invalid current state as visible errors', () => {
    const q = new URLSearchParams('schema=%7B&current=absent');
    expect(parse(q)).toEqual({ schema: '{', current: 'absent' });
    expect(() => machine(parse(q).schema, parse(q).current)).toThrow();
    expect(parse(new URLSearchParams(`schema=${'a'.repeat(7000)}`)).schema).toHaveLength(6001);
  });
  it('uses deterministic defaults with no query', () => {
    expect(parse(new URLSearchParams())).toEqual(defaults);
    expect(exportOwn(new URLSearchParams()).target).toBe('xstate');
    const custom = JSON.stringify({ states: ['ready'], initial: 'ready', transitions: [] });
    expect(parse(new URLSearchParams(`schema=${encodeURIComponent(custom)}`)).current).toBe('ready');
  });
});
