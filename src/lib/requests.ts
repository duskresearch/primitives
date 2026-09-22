// The request board's rules, free of storage: what counts as the same idea, what is
// already planned or live, and how old a suggestion reads.
import { primitives } from './server/request-catalogue';

const filler = new Set(['a', 'an', 'the', 'for', 'of', 'and', 'tool', 'tools', 'instrument', 'instruments', 'generator', 'maker', 'checker', 'picker', 'builder', 'editor', 'primitive']);

/** Lowercase words without accents, filler or plural endings: "The Sound tools" → "sound". */
export function normalize(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !filler.has(w))
    .map((w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w))
    .join(' ');
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const next = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = next;
    }
  }
  return row[b.length];
}

/**
 * The same idea written twice: equal once normalized, or a typo apart. Short words must
 * match exactly ("Chart" is not "Charm"); from six letters one slip is allowed, from ten two.
 */
export function sameIdea(a: string, b: string): boolean {
  if (a === b) return true;
  const n = Math.min(a.length, b.length);
  return n >= 6 && distance(a, b) <= (n >= 10 ? 2 : 1);
}

export interface CatalogueMatch {
  kind: 'live' | 'planned';
  name: string;
  primitive: string;
  href: string;
}

/** Whether a suggestion names something already in the catalogue, live or planned. */
export function findInCatalogue(text: string, primitive?: string | null): CatalogueMatch | null {
  const key = normalize(text);
  if (!key) return null;
  const words = new Set(key.split(' '));
  const matches: CatalogueMatch[] = [];
  for (const p of primitives) {
    if (normalize(p.name) === key) matches.push({ kind: p.shipped ? 'live' : 'planned', name: p.name, primitive: p.name, href: p.href });
    for (const i of p.instruments) {
      const name = normalize(i.name);
      const scoped = words.size === 2 && words.has(name) && words.has(normalize(p.name));
      const keyword = i.keywords.some((k) => normalize(k) === key);
      if ((name === key && (!primitive || primitive === p.slug)) || scoped || keyword)
        matches.push({ kind: i.live ? 'live' : 'planned', name: i.name, primitive: p.name, href: i.live ? i.href : p.href });
    }
  }
  return matches.find((m) => m.kind === 'live') ?? matches[0] ?? null;
}

export function age(createdAt: number, now = Date.now() / 1000): string {
  const days = Math.floor((now - createdAt) / 86400);
  if (days < 1) return 'today';
  if (days < 2) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}
