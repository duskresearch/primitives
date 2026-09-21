import { example, parseDefinition } from '@duskresearch/primitives/design/state';

export interface StateState { schema: string; current: string }
export const defaultSchema = JSON.stringify(example, null, 2);
export const defaults: StateState = { schema: defaultSchema, current: example.initial };

export function parse(q: URLSearchParams): StateState {
  const raw = q.get('schema');
  // Preserve a too-long value as invalid rather than silently reverting to the example.
  const schema = raw === null ? defaultSchema : raw.slice(0, 6001);
  let initial = example.initial;
  try { initial = parseDefinition(schema).initial; } catch { /* Keep the invalid draft visible. */ }
  return { schema, current: q.get('current') ?? initial };
}

export function serialize(state: StateState): string {
  const q = new URLSearchParams();
  q.set('schema', state.schema);
  q.set('current', state.current);
  return q.toString();
}

export function serializeWith(state: StateState, own: Record<string, string> = {}): string {
  const q = new URLSearchParams(serialize(state));
  for (const [key, value] of Object.entries(own)) q.set(key, value);
  return q.toString();
}

export const exportOwn = (q: URLSearchParams) => ({ target: q.get('target') === 'js' ? 'js' as const : 'xstate' as const });
