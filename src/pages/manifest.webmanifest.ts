import type { APIRoute } from 'astro';
import { field, site } from '@/lib/catalogue';
import tokens from '@/data/tokens.json';

// Icons are generated from the mark by scripts/build-assets.mjs.
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: site.name,
      short_name: site.name,
      description: site.subline,
      categories: [field],
      start_url: '/',
      display: 'browser',
      background_color: tokens.color.paper,
      theme_color: tokens.color.paper,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    }),
    { headers: { 'content-type': 'application/manifest+json' } },
  );
