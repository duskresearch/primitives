/** Values carried between Grid instruments. Client-safe: no catalogue import. */
export interface GridState { cols: number; gap: number; margin: number; max: number }
export const serialize = (s: GridState) => `cols=${s.cols}&gap=${s.gap}&margin=${s.margin}&max=${s.max}`;
export const serializeWith = (s: GridState, own: Record<string, string | number | boolean>) =>
  [serialize(s), ...Object.entries(own).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)].join('&');
/** Keep the overlay phase valid when its step changes without changing other settings. */
export const clampBaselineOffset = (offset: number, step: number) => Math.max(0, Math.min(offset, step - 1));
/** NumberField can accept decimals; the Baseline domain requires an integer step. */
export const normalizeBaselineStep = (step: number) => Math.min(24, Math.max(2, Math.round(step)));
