import type { APIRoute } from 'astro';
import { pages, primitives } from '@/lib/catalogue';

// Site pages, every primitive index, and every live instrument (state-free URLs only).
export const GET: APIRoute = ({ site }) => {
  const paths = [...pages.map((pg) => pg.href), ...primitives.flatMap((p) => [p.href, ...p.instruments.filter((i) => i.live).map((i) => i.href)])];
  const urls = paths.map((path) => `  <url><loc>${new URL(path, site)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
