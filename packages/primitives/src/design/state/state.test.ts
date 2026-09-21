import { describe, expect, it } from 'vitest';
// @ts-expect-error Node-only test: the browser project intentionally has no Node typings.
import { runInNewContext } from 'node:vm';
import { InputError } from '../../operation';
import { example, exportMachine, machine, parseDefinition, transition } from './index';

const schema = JSON.stringify(example);
const edit = (change: Partial<typeof example>) => JSON.stringify({ ...example, ...change });

describe('State machine operations', () => {
  it('walks a deterministic example and leaves unknown events unchanged', () => {
    const first = machine(schema);
    expect(first.current).toBe('idle');
    expect(first.events).toEqual([{ from: 'idle', event: 'FETCH', to: 'loading' }]);
    expect(transition(first.definition, 'idle', 'FETCH')).toBe('loading');
    expect(transition(first.definition, 'loading', 'RESOLVE')).toBe('success');
    expect(transition(first.definition, 'loading', 'REJECT')).toBe('error');
    expect(transition(first.definition, 'error', 'RETRY')).toBe('loading');
    expect(transition(first.definition, 'success', 'RESET')).toBe('idle');
    expect(transition(first.definition, 'loading', 'RESET')).toBe('loading');
    expect(() => machine(schema, 'missing')).toThrow(InputError);
  });

  it('rejects duplicate mappings, dangling edges and unsupported features', () => {
    expect(() => parseDefinition(edit({ transitions: [...example.transitions, { from: 'idle', event: 'FETCH', to: 'error' }] }))).toThrow('Duplicate transition');
    expect(() => parseDefinition(edit({ transitions: [{ from: 'idle', event: 'GO', to: 'absent' }] }))).toThrow('missing state');
    expect(() => parseDefinition(JSON.stringify({ ...example, guards: {} }))).toThrow('exactly states');
    expect(() => parseDefinition(edit({ initial: 'absent' }))).toThrow('Initial state');
    expect(() => parseDefinition(edit({ states: ['idle', 'idle'] }))).toThrow('unique');
  });

  it('enforces ASCII names, complexity and schema limits', () => {
    expect(() => parseDefinition('{')).toThrow('valid JSON');
    expect(() => parseDefinition('a'.repeat(6001))).toThrow('6000');
    expect(() => parseDefinition(edit({ states: Array.from({ length: 11 }, (_, i) => `s${i}`) }))).toThrow('1 to 10');
    expect(() => parseDefinition(edit({ transitions: Array.from({ length: 33 }, (_, i) => ({ from: 'idle', event: `E${i}`, to: 'idle' })) }))).toThrow('32 transitions');
    expect(() => parseDefinition(edit({ states: ['é'] }))).toThrow('ASCII');
    expect(() => parseDefinition(edit({ states: ['a'.repeat(33)] }))).toThrow('32 ASCII');
    expect(() => parseDefinition(JSON.stringify({ ...example, transitions: [{ from: 'idle', event: 'GO', to: 'loading', action: 'evil' }] }))).toThrow('exactly from');
  });

  it('exports valid XState configuration JSON and executable pure JS from the same edges', () => {
    const { config, js } = exportMachine(schema);
    const parsed = JSON.parse(config);
    expect(parsed.initial).toBe('idle');
    expect(parsed.states.loading.on.RESOLVE).toBe('success');
    expect(parsed.states.loading.on.REJECT).toBe('error');
    const fixtures: Array<[string, string, string]> = [
      ['idle', 'FETCH', 'loading'], ['loading', 'RESOLVE', 'success'],
      ['loading', 'REJECT', 'error'], ['error', 'RETRY', 'loading'],
      ['loading', 'RESET', 'loading'],
    ];
    for (const [state, event, expected] of fixtures) {
      expect(runInNewContext(`${js}\ntransition(${JSON.stringify(state)}, ${JSON.stringify(event)})`, {}, { timeout: 1000 })).toBe(expected);
    }
    expect(() => runInNewContext(`${js}\ntransition('absent', 'FETCH')`, {}, { timeout: 1000 })).toThrow('Unknown state');
  });
});
