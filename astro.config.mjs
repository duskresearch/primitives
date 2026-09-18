// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import svelte from '@astrojs/svelte';
import cloudflare from '@astrojs/cloudflare';
import tokens from './src/data/tokens.json' with { type: 'json' };

// tokens.json holds full stacks ("'Hanken Grotesk', Helvetica, Arial, sans-serif");
// the first family is self-hosted by the Fonts API, the rest become its fallbacks.
/** @param {string} s */
const stack = (s) => s.split(',').map((/** @type {string} */ f) => f.trim().replace(/^'|'$/g, ''));
const [sans, ...sansFallbacks] = stack(tokens.font.sans);
const [mono, ...monoFallbacks] = stack(tokens.font.mono);

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
  build: { format: 'file' },
  // No sessions: the URL is the only state.
  session: false,
  adapter: cloudflare({ imageService: 'passthrough' }),
  integrations: [svelte(), devCache],
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
      provider: fontProviders.fontsource(),
      name: mono,
      cssVariable: '--font-geist',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: monoFallbacks,
    },
  ],
});
