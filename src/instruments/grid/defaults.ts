import type { BreakpointsInput, BaselineInput, LayoutInput, LayoutPreset } from '@duskresearch/primitives/design/grid';
import type { GridState } from './state';
import catalogue from '../../data/catalogue.json';

/** Catalogue is server-only; no instrument Tool imports this file. */
const grid = catalogue.primitives.find((primitive) => primitive.slug === 'grid');
if (!grid?.state) throw new Error('Grid state is missing from the catalogue.');
const catalogueState = grid.state;
export const defaults: GridState = {
  cols: Number(catalogueState.cols), gap: Number(catalogueState.gap),
  margin: Number(catalogueState.margin), max: Number(catalogueState.max),
};
export const numberIn = (raw: string | null, min: number, max: number, fallback: number) => {
  if (raw === null || raw.trim() === '') return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
};
export const parse = (q: URLSearchParams): GridState => ({
  cols: numberIn(q.get('cols'), 1, 24, defaults.cols),
  gap: numberIn(q.get('gap'), 0, 64, defaults.gap),
  margin: numberIn(q.get('margin'), 0, 96, defaults.margin),
  max: numberIn(q.get('max'), 320, 2560, defaults.max),
});
export const parseColumnsOwn = (q: URLSearchParams) => ({ width: numberIn(q.get('width'), 240, 2560, 1280) });
export type BreakpointsOwn = Pick<BreakpointsInput, 'width' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>;
export const breakpointDefaults: BreakpointsOwn = { width: 900, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 };
export const parseBreakpointsOwn = (q: URLSearchParams): BreakpointsOwn => {
  const names = ['sm', 'md', 'lg', 'xl', 'xxl'] as const;
  const values = names.map((key) => numberIn(q.get(key), 240, 2560, breakpointDefaults[key]));
  const ordered = values.every((value, i) => i === 0 || value > values[i - 1]);
  return { width: numberIn(q.get('width'), 240, 2560, breakpointDefaults.width), ...(ordered ? Object.fromEntries(names.map((key, i) => [key, values[i]])) : { sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 }) } as BreakpointsOwn;
};
export type BaselineOwn = BaselineInput;
export const parseBaselineOwn = (q: URLSearchParams): BaselineOwn => {
  const step = numberIn(q.get('step'), 2, 24, 8);
  return { step, size: numberIn(q.get('size'), 12, 32, 16), leading: numberIn(q.get('leading'), 12, 64, 24), offset: numberIn(q.get('offset'), 0, step - 1, 0) };
};
export type LayoutOwn = Pick<LayoutInput, 'preset' | 'width' | 'collapse' | 'sidebar'>;
export const parseLayoutOwn = (q: URLSearchParams): LayoutOwn => {
  const raw = q.get('preset');
  const preset: LayoutPreset = raw === 'sidebar' || raw === 'holy-grail' || raw === 'dashboard' ? raw : 'sidebar';
  return { preset, width: numberIn(q.get('width'), 240, 2560, 1280), collapse: numberIn(q.get('collapse'), 320, 1600, 768), sidebar: numberIn(q.get('sidebar'), 120, 400, 240) };
};
