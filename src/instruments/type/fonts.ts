// Every Google Fonts family, from src/data/fonts.json (built by scripts/build-fonts.mjs),
// and loading any of them on demand from Fontsource on jsDelivr: no request reaches Google.
// Pages hand their tools the few faces the first render needs (see seed.ts); the full list
// is fetched as a hashed, long-cached file only when a tool needs more.
import { metricsFrom, type Category, type Metrics } from '@duskresearch/primitives/design/type';
import fontsUrl from '@/data/fonts.json?url';

export interface Font {
  id: string;
  family: string;
  category: Category;
  weights: number[];
  italic: boolean;
  variable: boolean;
  axes: [string, number, number][];
  subsets: string[];
  popularity: number;
  trending: number;
  added: string;
  designers: string[];
  metrics: Metrics | null;
}

export interface SystemFont {
  family: string;
  category: string;
  metrics: Metrics;
}

export interface Raw {
  subsets: string[];
  designers: string[];
  fonts: { i: string; f: string; c: Category; w: number[]; it?: 1; ax?: [string, number, number][]; s: number[]; p: number; t: number; a: string; d: number[]; m: number[] | null }[];
  system: { family: string; category: string; metrics: number[] }[];
}

export interface Fonts {
  fonts: Font[];
  byId: Map<string, Font>;
  system: SystemFont[];
}

/** The compact file, expanded: indices resolved, metrics named. */
export function expand(raw: Raw): Fonts {
  const fonts = raw.fonts.map(
    (f): Font => ({
      id: f.i,
      family: f.f,
      category: f.c,
      weights: f.w,
      italic: f.it === 1,
      variable: (f.ax ?? []).some(([tag]) => tag === 'wght'),
      axes: f.ax ?? [],
      subsets: f.s.map((x) => raw.subsets[x]),
      popularity: f.p,
      trending: f.t,
      added: f.a,
      designers: f.d.map((x) => raw.designers[x]),
      metrics: f.m ? metricsFrom(f.m) : null,
    }),
  );
  return { fonts, byId: new Map(fonts.map((f) => [f.id, f])), system: raw.system.map((s) => ({ ...s, metrics: metricsFrom(s.metrics) })) };
}

/** System fonts a page can name in local(): the ones with a real family name. */
export const localSystem = (system: SystemFont[]) => system.filter((f) => /^[A-Z]/.test(f.family));

let data: Promise<Fonts> | undefined;

export function loadFonts() {
  data ??= fetch(fontsUrl)
    .then((r) => r.json() as Promise<Raw>)
    .then(expand);
  return data;
}

/** Resolves once the page has loaded, so later requests never compete with the first paint. */
export const afterLoad = (): Promise<void> =>
  new Promise((resolve) => (document.readyState === 'complete' ? resolve() : window.addEventListener('load', () => resolve(), { once: true })));

/** The list, once the page has loaded and gone idle. */
export const loadFontsSoon = (): Promise<Fonts> => afterLoad().then(() => new Promise((resolve) => (window.requestIdleCallback ?? setTimeout)(() => resolve(loadFonts()))));

/** The site already serves Hanken Grotesk; use it instead of fetching a second copy. */
const SITE_FACE = 'hanken-grotesk';
const loaded = new Map<string, Promise<void>>();
const CDN = 'https://cdn.jsdelivr.net/fontsource/fonts';

/**
 * The CSS font-family for a face, fetching its file the first time: the variable file when
 * there is one (every weight in one request), otherwise the weight asked for. Latin where the
 * face has it, else its first script.
 */
export function faceFor(font: Font, weight = 400, italic = false): { family: string; ready: Promise<void> } {
  if (font.id === SITE_FACE) return { family: 'var(--font-hanken)', ready: Promise.resolve() };
  const style = italic && font.italic ? 'italic' : 'normal';
  const w = font.variable ? 'wght' : String(font.weights.includes(weight) ? weight : font.weights.reduce((a, b) => (Math.abs(b - weight) < Math.abs(a - weight) ? b : a)));
  const subset = font.subsets.includes('latin') ? 'latin' : font.subsets[0];
  const alias = `pf-${font.id}-${w}-${style}`;
  if (!loaded.has(alias)) {
    const url = font.variable ? `${CDN}/${font.id}:vf@latest/${subset}-wght-${style}.woff2` : `${CDN}/${font.id}@latest/${subset}-${w}-${style}.woff2`;
    const range = font.variable ? `${font.axes.find(([t]) => t === 'wght')![1]} ${font.axes.find(([t]) => t === 'wght')![2]}` : w;
    const face = new FontFace(alias, `url(${url}) format("woff2")`, { weight: range, style, display: 'swap' });
    loaded.set(
      alias,
      face.load().then(
        (f) => void document.fonts.add(f),
        () => undefined,
      ),
    );
  }
  return { family: `"${alias}"`, ready: loaded.get(alias)! };
}

/** The generic family a category falls back to. */
export const genericFor = (c: Category) => ({ sans: 'sans-serif', serif: 'serif', mono: 'monospace', display: 'sans-serif', handwriting: 'cursive' })[c];

/**
 * The CSS font-family stack for a face id once its file is in: the face, then its generic
 * family. The site's own face resolves at once; a face the page already knows loads its file;
 * any other waits for the fonts list first.
 */
export async function familyFor(id: string, known?: Font, weight = 400, italic = false): Promise<string> {
  if (id === SITE_FACE) return 'var(--font-hanken), sans-serif';
  const font = known?.id === id ? known : (await loadFonts()).byId.get(id);
  if (!font) return 'var(--font-hanken), sans-serif';
  const face = faceFor(font, weight, italic);
  await face.ready;
  return `${face.family}, ${genericFor(font.category)}`;
}
