// Spotlight matching. Pure, so it runs in the island and in tests alike.
// Every word of the query must appear somewhere in an item's terms; names that match
// the whole query rank above items that only mention it.

export interface SearchItem {
  kind: 'instrument' | 'primitive' | 'page';
  /** Group label in the results, e.g. "Color", "Primitives", "Pages". */
  group: string;
  /** Primitive slug, used to fade landing tiles that have no match. */
  primitive?: string;
  name: string;
  does: string;
  href: string;
  /** Right-hand column: the address, or "In preparation". */
  address: string;
  /** Not live yet: drawn in ink-2, like unshipped tiles. */
  muted: boolean;
  /** Listed when the query is empty, where the panel doubles as a site map. */
  browse: boolean;
  /** Lowercased name, primitive, description and keywords. */
  terms: string;
}

export interface SearchGroup {
  label: string;
  rows: { item: SearchItem; index: number }[];
}

function score(item: SearchItem, query: string, words: string[]): number {
  if (!words.every((w) => item.terms.includes(w))) return 0;
  const name = item.name.toLowerCase();
  if (name === query) return 4;
  if (name.startsWith(query)) return 3;
  if (name.includes(query)) return 2;
  return 1;
}

/**
 * Results grouped in display order. `index` numbers the rows top to bottom, so the
 * first row (index 0) is the best match and keyboard selection follows what is seen.
 */
export function search(items: SearchItem[], raw: string): { groups: SearchGroup[]; hits: SearchItem[] } {
  const query = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  const words = query ? query.split(' ') : [];

  const scored = items
    .map((item, order) => ({ item, order, s: words.length ? score(item, query, words) : item.browse ? 1 : 0 }))
    .filter((x) => x.s > 0);

  const byGroup = new Map<string, typeof scored>();
  for (const x of scored) {
    if (!byGroup.has(x.item.group)) byGroup.set(x.item.group, []);
    byGroup.get(x.item.group)!.push(x);
  }

  // Better score first; on a tie, live before in preparation, then primitives before
  // instruments before pages, then catalogue order. Groups follow their best row.
  const kindRank = { primitive: 0, instrument: 1, page: 2 };
  const before = (a: (typeof scored)[number], b: (typeof scored)[number]) =>
    b.s - a.s || Number(a.item.muted) - Number(b.item.muted) || kindRank[a.item.kind] - kindRank[b.item.kind] || a.order - b.order;
  const ordered = [...byGroup.entries()]
    .map(([label, rows]) => ({ label, rows: rows.sort(before) }))
    .sort((a, b) => (words.length ? before(a.rows[0], b.rows[0]) : 0));

  const hits: SearchItem[] = [];
  const groups = ordered.map(({ label, rows }) => ({
    label,
    rows: rows.map(({ item }) => ({ item, index: hits.push(item) - 1 })),
  }));
  return { groups, hits };
}
