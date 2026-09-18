// Typed access to src/data/catalogue.json plus the instruments that are actually built.
// The catalogue is the source of truth for names, copy and marks; an instrument is
// "live" once its folder in src/instruments has a meta.ts.
import data from '@/data/catalogue.json';
import tokens from '@/data/tokens.json';
import type { InstrumentMeta } from './instrument';
import type { SearchItem } from './search';

export interface MarkLayer {
  w?: string;
  h?: string;
  bg?: string;
  bs?: string;
  r?: string;
  cp?: string;
  tf?: string;
  bd?: string;
  bc?: string;
  blend?: string;
}

export interface Instrument {
  n: string;
  name: string;
  slug: string;
  does: string;
  pain?: string;
  primaryValue?: string;
  keywords: string[];
  primitive: string;
  href: string;
  live: boolean;
  meta?: InstrumentMeta;
}

export interface Primitive {
  n: string;
  name: string;
  slug: string;
  shipped: boolean;
  hue: number;
  list: string;
  intro: string[];
  mark: MarkLayer[];
  letter?: string;
  inkAccent: boolean;
  instruments: Instrument[];
  href: string;
}

const metas = import.meta.glob<{ default: InstrumentMeta }>('/src/instruments/*/*/meta.ts', { eager: true });
const metaFor = (primitive: string, slug: string) => metas[`/src/instruments/${primitive}/${slug}/meta.ts`]?.default;

type RawInstrument = { n?: string; name: string; slug?: string; does: string; pain?: string; primaryValue?: string; keywords?: string[] };
type RawPrimitive = (typeof data.primitives)[number] & { intro?: string[]; letter?: string; accent?: string; instruments: RawInstrument[] };

export const site = data.site;
export const explanationHeadings = data.explanationHeadings;

export const primitives: Primitive[] = (data.primitives as RawPrimitive[]).map((p) => {
  const shipped = p.status === 'shipped';
  const instruments = p.instruments.map((i, idx): Instrument => {
    const slug = i.slug ?? i.name.toLowerCase();
    const meta = shipped ? metaFor(p.slug, slug) : undefined;
    return {
      n: i.n ?? String(idx + 1).padStart(2, '0'),
      name: i.name,
      slug,
      does: i.does,
      pain: i.pain,
      primaryValue: i.primaryValue,
      keywords: i.keywords ?? [],
      primitive: p.slug,
      href: `/${p.slug}/${slug}`,
      live: Boolean(meta),
      meta,
    };
  });
  return {
    n: p.n,
    name: p.name,
    slug: p.slug,
    shipped,
    hue: p.hue,
    list: p.list,
    intro: p.intro ?? [],
    mark: p.mark as MarkLayer[],
    letter: p.letter,
    inkAccent: p.accent === 'ink',
    instruments,
    href: `/${p.slug}`,
  };
});

export const counts = {
  primitives: primitives.length,
  instruments: primitives.reduce((sum, p) => sum + p.instruments.length, 0),
};

export function getPrimitive(slug: string): Primitive {
  const p = primitives.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown primitive: ${slug}`);
  return p;
}

export function getInstrument(primitive: string, slug: string): Instrument {
  const i = getPrimitive(primitive).instruments.find((x) => x.slug === slug);
  if (!i) throw new Error(`Unknown instrument: ${primitive}/${slug}`);
  return i;
}

export const tint = (p: Primitive) => tokens.tint[p.shipped ? 'shipped' : 'unshipped'].replace('H', String(p.hue));

export const countLabel = (p: Primitive) => `${p.instruments.length} instrument${p.instruments.length === 1 ? '' : 's'}`;

export function nextPrimitive(p: Primitive): Primitive {
  const idx = primitives.indexOf(p);
  return primitives[(idx + 1) % primitives.length];
}

/** Previous and next live instruments within the same primitive, wrapping around. */
export function siblings(i: Instrument): { prev?: Instrument; next?: Instrument } {
  const live = getPrimitive(i.primitive).instruments.filter((x) => x.live);
  const idx = live.findIndex((x) => x.slug === i.slug);
  if (live.length < 2 || idx === -1) return {};
  return { prev: live[(idx - 1 + live.length) % live.length], next: live[(idx + 1) % live.length] };
}

export function related(i: Instrument): Instrument[] {
  return (i.meta?.related ?? [])
    .map((ref) => {
      const [p, s] = ref.includes('/') ? ref.split('/') : [i.primitive, ref];
      return getInstrument(p, s);
    });
}

/** Site pages outside the primitive tree. Static pages add themselves here as they ship. */
export const pages: { name: string; does: string; href: string; keywords?: string[] }[] = [
  { name: 'Home', does: 'Every primitive, and the request line', href: '/', keywords: ['landing', 'all', 'index', 'request'] },
  { name: 'About', does: 'What Primitives is, who makes it, and why OKLCH and the URL', href: '/about', keywords: ['dusk research', 'contribute', 'github', 'open source'] },
];

/**
 * Everything the spotlight can find, in browse order: instruments grouped by primitive,
 * then the primitives themselves, then pages. Instruments not built yet are found by
 * search but not listed when browsing; they open their primitive's index.
 */
export function searchIndex(): SearchItem[] {
  const terms = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' ').toLowerCase();
  const instruments = primitives.flatMap((p) =>
    p.instruments.map(
      (i): SearchItem => ({
        kind: 'instrument',
        group: p.name,
        primitive: p.slug,
        name: i.name,
        does: i.does,
        href: i.live ? i.href : p.href,
        address: i.live ? i.href : 'In preparation',
        muted: !i.live,
        browse: i.live,
        terms: terms(i.name, p.name, i.does, ...i.keywords),
      }),
    ),
  );
  const prims = primitives.map(
    (p): SearchItem => ({
      kind: 'primitive',
      group: 'Primitives',
      primitive: p.slug,
      name: p.name,
      does: p.list,
      href: p.href,
      address: p.href,
      muted: !p.shipped,
      browse: true,
      terms: terms(p.name, p.list),
    }),
  );
  const pageItems = pages.map(
    (pg): SearchItem => ({
      kind: 'page',
      group: 'Pages',
      name: pg.name,
      does: pg.does,
      href: pg.href,
      address: pg.href,
      muted: false,
      browse: true,
      terms: terms(pg.name, pg.does, ...(pg.keywords ?? [])),
    }),
  );
  return [...instruments, ...prims, ...pageItems];
}
