import { describe, expect, it } from 'vitest';
import { searchIndex } from './catalogue';
import { search } from './search';

const items = searchIndex();
const top = (q: string) => search(items, q).hits[0];
const names = (q: string) => search(items, q).hits.map((h) => `${h.kind}:${h.group}/${h.name}`);

describe('spotlight search', () => {
  it('browses live instruments, then every primitive, then pages', () => {
    const { groups, hits } = search(items, '');
    expect(groups.map((g) => g.label)).toEqual(['Color', 'Type', 'Grid', 'Shape', 'Motion', 'Primitives', 'Pages']);
    expect(groups.find((g) => g.label === 'Grid')?.rows.map(({ item }) => [item.name, item.href])).toEqual([
      ['Columns', '/grid/columns'],
      ['Breakpoints', '/grid/breakpoints'],
      ['Baseline', '/grid/baseline'],
      ['Layout', '/grid/layout'],
    ]);
    expect(hits.filter((h) => h.kind === 'primitive')).toHaveLength(13);
    expect(hits.every((h) => !h.muted || h.kind === 'primitive')).toBe(true);
  });

  it('finds primitives by name, ahead of instruments that mention them', () => {
    expect(top('color')).toMatchObject({ kind: 'primitive', href: '/color' });
    expect(top('noise')).toMatchObject({ kind: 'primitive', href: '/noise', muted: true });
    // Icon has a planned instrument called Grid; the live primitive wins the tie.
    expect(top('grid')).toMatchObject({ kind: 'primitive', href: '/grid' });
  });

  it('matches every word, anywhere in the terms', () => {
    expect(top('modular scale')).toMatchObject({ group: 'Type', name: 'Scale' });
    expect(top('wcag')).toMatchObject({ name: 'Contrast', href: '/color/contrast' });
  });

  it('finds instruments in preparation and opens their primitive', () => {
    expect(top('uuid')).toMatchObject({ name: 'UUID', href: '/random', address: 'In preparation', muted: true });
  });

  it('ranks exact names first and groups by best match', () => {
    const scale = names('scale');
    expect(scale.slice(0, 3)).toEqual(['instrument:Color/Scale', 'instrument:Type/Scale', 'instrument:Space/Scale']);
    expect(search(items, 'scale').groups[0].rows[0].index).toBe(0);
  });

  it('finds pages', () => {
    expect(top('home')).toMatchObject({ kind: 'page', href: '/' });
  });

  it('returns nothing for nonsense', () => {
    expect(search(items, 'zzzz').hits).toHaveLength(0);
  });
});
