// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import svelte from '@astrojs/svelte';
import cloudflare from '@astrojs/cloudflare';
import { spacefastAstroAdapter } from '@spacefast/astro/adapter';
import tokens from './src/data/tokens.json' with { type: 'json' };

// tokens.json holds full stacks ("'Hanken Grotesk', Helvetica, Arial, sans-serif");
// the first family is self-hosted by the Fonts API, the rest become its fallbacks.
/** @param {string} s */
const stack = (s) => s.split(',').map((/** @type {string} */ f) => f.trim().replace(/^'|'$/g, ''));
const [sans, ...sansFallbacks] = stack(tokens.font.sans);
const [mono, ...monoFallbacks] = stack(tokens.font.mono);
const spacefast = /** @type {{ process?: { env: Record<string, string | undefined> } }} */ (globalThis).process?.env.PRIMITIVES_TARGET === 'spacefast';

// `astro dev` gets its own Vite cache. Builds, checks and previews share node_modules/.vite
// and re-optimize its dependencies, which deletes files a running dev server still uses.
/** @type {import('astro').AstroIntegration} */
const devCache = {
  name: 'dev-cache',
  hooks: {
    'astro:config:setup': ({ command, updateConfig }) => {
      if (command === 'dev') updateConfig({ vite: { cacheDir: 'node_modules/.vite-dev' } });
    },
  },
};

export default defineConfig({
  site: 'https://primitiv.es',
  trailingSlash: 'never',
  // Inline CSS: one fewer render-blocking request; the whole stylesheet is small.
  build: { format: 'file', inlineStylesheets: 'always' },
  // No sessions: the URL is the only state.
  session: false,
  adapter: spacefast ? spacefastAstroAdapter() : cloudflare({ imageService: 'passthrough' }),
  integrations: [svelte(), devCache],
  vite: { resolve: { alias: { '#runtime-bindings': new URL(spacefast ? './src/lib/server/bindings-spacefast.ts' : './src/lib/server/bindings-cloudflare.ts', import.meta.url).pathname } } },
  ...(spacefast ? { outDir: './dist-spacefast', build: { format: 'file', inlineStylesheets: 'always', server: 'server', client: 'client' } } : {}),
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: false },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: sans,
      cssVariable: '--font-hanken',
      weights: [300, 400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: sansFallbacks,
    },
    {
      // Departure Mono (Helena Zhang, SIL OFL 1.1), self-hosted from the repo. A pixel font on
      // an 11 px grid: set it at 11 or 22 px so its pixels land on whole screen pixels.
      provider: fontProviders.local(),
      name: mono,
      cssVariable: '--font-departure',
      fallbacks: monoFallbacks,
      options: {
        variants: [{ src: ['./src/assets/fonts/DepartureMono-Regular.woff2'], weight: 400, style: 'normal' }],
      },
    },
  ],
});
