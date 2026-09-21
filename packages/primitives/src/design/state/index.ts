import { InputError } from '../../operation';

export interface Transition { from: string; event: string; to: string }
export interface Definition { states: string[]; initial: string; transitions: Transition[] }

export const example: Definition = {
  states: ['idle', 'loading', 'success', 'error'],
  initial: 'idle',
  transitions: [
    { from: 'idle', event: 'FETCH', to: 'loading' },
    { from: 'loading', event: 'RESOLVE', to: 'success' },
    { from: 'loading', event: 'REJECT', to: 'error' },
    { from: 'error', event: 'RETRY', to: 'loading' },
    { from: 'success', event: 'RESET', to: 'idle' },
  ],
};

const identifier = /^[A-Za-z][A-Za-z0-9_]{0,31}$/;
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const exactKeys = (value: Record<string, unknown>, keys: string[]): boolean =>
  Object.keys(value).sort().join('|') === keys.slice().sort().join('|');
const validName = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || !identifier.test(value)) {
    throw new InputError(`${label} must start with a letter and contain at most 32 ASCII letters, digits or underscores.`);
  }
  return value;
};

export function parseDefinition(schema: string): Definition {
  if (typeof schema !== 'string' || schema.length > 6000) {
    throw new InputError('Machine JSON must be at most 6000 characters.');
  }
  let raw: unknown;
  try { raw = JSON.parse(schema); }
  catch { throw new InputError('Machine JSON is not valid JSON.'); }
  if (!record(raw) || !exactKeys(raw, ['states', 'initial', 'transitions'])) {
    throw new InputError('Machine needs exactly states, initial and transitions. Guards, actions and nested states are not supported.');
  }
  if (!Array.isArray(raw.states) || raw.states.length < 1 || raw.states.length > 10) {
    throw new InputError('Machine needs 1 to 10 states.');
  }
  const states = raw.states.map((name, i) => validName(name, `State ${i + 1}`));
  if (new Set(states).size !== states.length) throw new InputError('State names must be unique.');
  const initial = validName(raw.initial, 'Initial state');
  if (!states.includes(initial)) throw new InputError('Initial state must be one of the states.');
  if (!Array.isArray(raw.transitions) || raw.transitions.length > 32) {
    throw new InputError('Machine supports at most 32 transitions.');
  }
  const seen = new Set<string>();
  const transitions = raw.transitions.map((item, i) => {
    if (!record(item) || !exactKeys(item, ['from', 'event', 'to'])) {
      throw new InputError(`Transition ${i + 1} needs exactly from, event and to.`);
    }
    const from = validName(item.from, `Transition ${i + 1} source`);
    const event = validName(item.event, `Transition ${i + 1} event`);
    const to = validName(item.to, `Transition ${i + 1} target`);
    if (!states.includes(from) || !states.includes(to)) {
      throw new InputError(`Transition ${i + 1} refers to a missing state.`);
    }
    const pair = `${from}\0${event}`;
    if (seen.has(pair)) throw new InputError(`Duplicate transition for ${from} on ${event}.`);
    seen.add(pair);
    return { from, event, to };
  });
  return { states, initial, transitions };
}

export function transition(definition: Definition, current: string, event: string): string {
  if (!definition.states.includes(current)) throw new InputError('Current state is not in this machine.');
  validName(event, 'Event');
  return definition.transitions.find((item) => item.from === current && item.event === event)?.to ?? current;
}

export function machine(schema: string, current?: string) {
  const definition = parseDefinition(schema);
  const active = current ?? definition.initial;
  if (!definition.states.includes(active)) throw new InputError('Current state is not in this machine.');
  return {
    definition,
    current: active,
    events: definition.transitions.filter((item) => item.from === active),
    json: JSON.stringify(definition, null, 2),
  };
}

export function exportMachine(schema: string) {
  const definition = parseDefinition(schema);
  const states: Record<string, { on?: Record<string, string> }> = Object.create(null);
  for (const name of definition.states) states[name] = {};
  for (const item of definition.transitions) {
    if (!states[item.from].on) states[item.from].on = Object.create(null);
    states[item.from].on![item.event] = item.to;
  }
  const config = JSON.stringify({ id: 'primitiveMachine', initial: definition.initial, states }, null, 2);
  const names = JSON.stringify(definition.states);
  const edges = JSON.stringify(definition.transitions);
  const js = `function transition(state, event) {\n  const states = ${names};\n  const transitions = ${edges};\n  if (!states.includes(state)) throw new Error('Unknown state.');\n  if (typeof event !== 'string') throw new Error('Event must be a string.');\n  const match = transitions.find((edge) => edge.from === state && edge.event === event);\n  return match ? match.to : state;\n}`;
  return { config, js };
}

export const operations = { machine, exportMachine };
