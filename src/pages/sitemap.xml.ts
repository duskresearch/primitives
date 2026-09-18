import type { APIRoute } from 'astro';
import { field } from '@/lib/catalogue';

// A sitemap index with one sitemap per field, so a second field adds a line here rather than
// changing the URL search engines already know.
export const GET: APIRoute = ({ site }) =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${new URL(`/sitemap-${field}.xml`, site)}</loc></sitemap>\n</sitemapindex>\n`,
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  );
