import data from '../../data/catalogue.json';
import live from '../../data/live-instruments.json';

export const site = data.site;
export const primitives = data.primitives.map((p) => ({
  name: p.name,
  slug: p.slug,
  href: `/${p.slug}`,
  shipped: p.status === 'shipped',
  instruments: p.instruments.map((i) => {
    const slug = i.slug ?? i.name.toLowerCase();
    const href = `/${p.slug}/${slug}`;
    return { name: i.name, keywords: i.keywords ?? [], href, live: p.status === 'shipped' && live.includes(href) };
  }),
}));
