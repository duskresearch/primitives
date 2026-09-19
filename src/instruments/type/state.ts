// The Type primitive's shared state, carried by every Type instrument in the URL: the base
// size and ratio of the scale, the chosen face (a Fontsource id) and the sample text.
// Client-safe; parsing with defaults lives in ./defaults.ts (server side).
export interface TypeState {
  base: number;
  ratio: number;
  font: string;
  text: string;
}

export const TEXT_MAX = 120;

export const serialize = (s: TypeState) =>
  `base=${s.base}&ratio=${s.ratio}&font=${encodeURIComponent(s.font)}&text=${encodeURIComponent(s.text)}`;

/** The shared state plus an instrument's own settings. */
export const serializeWith = (s: TypeState, own: Record<string, string | number | boolean>) =>
  [serialize(s), ...Object.entries(own).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)].join('&');
