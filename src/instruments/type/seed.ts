// Server only: the faces a Type page's first render needs, taken from the full list so the
// HTML arrives complete and the browser fetches the list only when a tool needs more.
// Never import this from a Tool; it would put all 1,946 families in the client bundle.
import raw from '@/data/fonts.json';
import { pairingsFor } from '@duskresearch/primitives/design/type';
import { expand, localSystem, type Font, type Raw } from './fonts';

const all = expand(raw as Raw);

/**
 * A face as a page hands it to a tool: of its languages, only the script its file loads in.
 * A face only listed (not the chosen one) keeps just what a row shows and its file needs;
 * the full list, once fetched, replaces both.
 */
function trim(f: Font, listed: boolean): Font {
  const face = { ...f, subsets: f.subsets.includes('latin') ? ['latin'] : f.subsets.slice(0, 1) };
  return listed ? { ...face, axes: f.axes.filter(([tag]) => tag === 'wght'), designers: [], popularity: 0, trending: 0, added: '', metrics: null } : face;
}

/** The faces a first render needs; `chosen` in full, the rest as rows. */
export function seedFonts(chosen: string, listed: Iterable<string> = []): Font[] {
  return [...new Set([chosen, ...listed])]
    .map((id) => all.byId.get(id))
    .filter((f): f is Font => Boolean(f))
    .map((f) => trim(f, f.id !== chosen));
}

export const seedFont = (id: string): Font | undefined => seedFonts(id)[0];

/** The faces that pair with a face, by id, as Specimen suggests them. */
export function pairIds(id: string): string[] {
  const f = all.byId.get(id);
  if (!f?.metrics) return [];
  return pairingsFor({ ...f, metrics: f.metrics }, all.fonts).map((c) => c.id);
}

export const system = localSystem(all.system);
