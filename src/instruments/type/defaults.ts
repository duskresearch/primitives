import { TEXT_MAX, type TypeState } from './state';

/** The site's own face by default: it is already loaded, so nothing more is fetched. */
export const defaults: TypeState = { base: 16, ratio: 1.25, font: 'hanken-grotesk', text: 'Sphinx of black quartz, judge my vow' };

/** A number from the URL, kept inside a range; anything else falls back. */
export const numberIn = (value: string | null, min: number, max: number, fallback: number) => {
  const n = Number(value);
  return value !== null && value.trim() !== '' && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export const oneOf = <T extends string>(value: string | null, options: readonly T[], fallback: T): T => (options.includes(value as T) ? (value as T) : fallback);

export const parse = (params: URLSearchParams): TypeState => ({
  base: numberIn(params.get('base'), 8, 40, defaults.base),
  ratio: numberIn(params.get('ratio'), 1.01, 2, defaults.ratio),
  font: /^[a-z0-9-]{1,80}$/.test(params.get('font') ?? '') ? params.get('font')! : defaults.font,
  text: (params.get('text') ?? '').trim().slice(0, TEXT_MAX) || defaults.text,
});
