import type { ShapeForm, Point, PolygonPreset } from '@duskresearch/primitives/design/shape';

/** Catalogue values are symbolic; these are the numeric contract for every Shape route. */
export interface ShapeState { form: ShapeForm; sides: number; radius: number; rotation: number }
export const defaults: ShapeState = { form: 'circle', sides: 6, radius: 40, rotation: 0 };
export const limits = { sides: [3, 12], radius: [1, 50], rotation: [0, 359], inner: [0.1, 0.9], cornerRadius: [0, 50], smoothing: [0, 1], complexity: [3, 12], irregularity: [0, 0.35], padding: [0, 30] } as const;
export const numeric = (raw: string | null, min: number, max: number, fallback: number, decimals = 0) => {
  if (raw === null || raw.trim() === '' || raw.length > 32) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Number(n.toFixed(decimals)))) : fallback;
};
const forms = ['circle', 'square', 'triangle', 'ngon', 'star'];
export const parse = (q: URLSearchParams): ShapeState => ({
  form: forms.includes(q.get('form') ?? '') ? q.get('form') as ShapeForm : defaults.form,
  sides: numeric(q.get('sides'), ...limits.sides, defaults.sides),
  radius: numeric(q.get('radius'), ...limits.radius, defaults.radius, 2),
  rotation: numeric(q.get('rotation'), ...limits.rotation, defaults.rotation, 2),
});
export const serialize = (s: ShapeState) => `form=${s.form}&sides=${s.sides}&radius=${s.radius}&rotation=${s.rotation}`;
export const serializeWith = (s: ShapeState, own: Record<string, string | number | boolean>) =>
  [serialize(s), ...Object.entries(own).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)].join('&');
export const formOwn = (q: URLSearchParams) => ({ inner: numeric(q.get('inner'), ...limits.inner, 0.5, 2) });
export const polygonOwn = (q: URLSearchParams): { preset: PolygonPreset; points: Point[] | null } => {
  const preset = ['triangle', 'square', 'hexagon', 'star', 'custom'].includes(q.get('preset') ?? '') ? q.get('preset') as PolygonPreset : 'hexagon';
  const raw = q.get('points');
  // Generated presets use four decimals. Allow twelve full-precision pairs so
  // editing one point cannot make the untouched preset points disappear on reload.
  if (!raw || raw.length > 216 || !/^(?:\d{1,3}(?:\.\d{1,4})?,\d{1,3}(?:\.\d{1,4})?;){2,11}\d{1,3}(?:\.\d{1,4})?,\d{1,3}(?:\.\d{1,4})?$/.test(raw)) return { preset, points: null };
  const points = raw.split(';').map((point) => { const [x, y] = point.split(',').map(Number); return { x, y }; });
  return points.length >= 3 && points.length <= 12 && points.every(({x,y}) => x <= 100 && y <= 100) ? { preset, points } : { preset, points: null };
};
export const pointsString = (points: Point[]) => points.map(({x,y}) => `${x},${y}`).join(';');
export const cornerOwn = (q: URLSearchParams) => ({ cornerRadius: numeric(q.get('cornerRadius'), ...limits.cornerRadius, 32, 1), smoothing: numeric(q.get('smoothing'), ...limits.smoothing, 0.75, 2) });
export const blobOwn = (q: URLSearchParams) => ({ seed: numeric(q.get('seed'), 0, 4294967295, 12345), complexity: numeric(q.get('complexity'), ...limits.complexity, 7), irregularity: numeric(q.get('irregularity'), ...limits.irregularity, 0.24, 2) });
export const hex = (raw: string | null, fallback: string) => /^#?[\da-f]{6}$/i.test(raw ?? '') ? `#${raw!.replace('#', '').toLowerCase()}` : fallback;
export const faviconOwn = (q: URLSearchParams) => ({ foreground: hex(q.get('foreground'), '#1a1a17'), background: hex(q.get('background'), '#f4f1ea'), padding: numeric(q.get('padding'), ...limits.padding, 12, 1), inner: numeric(q.get('inner'), ...limits.inner, 0.5, 2) });
