// Typed access to src/data/catalogue.json plus the instruments that are actually built.
// The catalogue is the source of truth for names, copy and marks; an instrument is
// "live" once its folder in src/instruments has a meta.ts.
import data from '@/data/catalogue.json';
import tokens from '@/data/tokens.json';
import type { InstrumentMeta } from './instrument';

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

export interface SearchItem {
  primitive: string;
  primitiveName: string;
  name: string;
  does: string;
  href: string;
  terms: string;
}

/** Every live instrument, in catalogue order: the spotlight's index and site map. */
export function searchIndex(): SearchItem[] {
  return primitives.flatMap((p) =>
    p.instruments
      .filter((i) => i.live)
      .map((i) => ({
        primitive: p.slug,
        primitiveName: p.name,
        name: i.name,
        does: i.does,
        href: i.href,
        terms: [i.name, p.name, i.does, ...i.keywords].join(' ').toLowerCase(),
      })),
  );
}
