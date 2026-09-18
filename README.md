# Primitives

Small, single-purpose instruments for the fundamental elements of digital work, grouped by primitive: Color, Type, Grid, Shape, Motion and more. Live at [primitiv.es](https://primitiv.es). Made by Dusk Research.

## Develop

```sh
npm install
npm run dev       # http://localhost:4321, runs in the Workers runtime (workerd)
npm test          # unit tests (color math, URL state)
npm run check     # type check
npm run assets    # favicons, app icons, OG images (also run by dev and build)
npm run db:migrate            # apply migrations/ to the local D1 database
npm run requests -- held      # review the /requests board (see scripts/requests.mjs; --remote for production)
npm run build     # static pages + the Worker for on-demand instrument pages
npm run preview   # serve the production build locally
```

Stack: Astro with Svelte islands, deployed to Cloudflare Workers with static assets and D1 (suggestions, votes, the email list). Local development uses a local D1 and `.dev.vars` for `VOTE_SALT`; production needs `wrangler secret put VOTE_SALT`. Fonts are Hanken Grotesk and Geist Mono, self-hosted by the Astro Fonts API. Color math uses [culori](https://culorijs.org).

## Layout

```
design/                     the design brief (README.md), the mark (MARK.md), the approved reference,
                            and brand/ avatars for social profiles
packages/primitives/        the instruments' logic, one module per primitive: JSON in, JSON out
                            (future endpoints and npm package; see its README)
src/data/tokens.json        every design value; scripts/build-tokens.mjs writes src/styles/tokens.css
src/data/catalogue.json     every primitive and instrument, shipped and planned, with copy
src/instruments/<p>/<i>/    one folder per instrument: meta.ts, Tool.svelte, explain.md
src/pages/<p>/<i>.astro     the instrument's route: parses URL state, renders the harness
src/layouts/Instrument.astro   the harness: breadcrumb, stateful address, tool chrome, explanation, related
src/lib/logo.ts             the Primitives mark, the one source for header, favicons, icons and OG
scripts/build-assets.mjs    renders icons and OG images (Satori + resvg) into public/, gitignored
```

## Adding an instrument

1. Put its logic in `packages/primitives/src/<primitive>/` as an operation keyed by the instrument's slug, with tests. The tool imports it from `@duskresearch/primitives/<primitive>`.
2. Its entry already exists in `src/data/catalogue.json` (name, number, does, pain, keywords, primary value). Keep copy there.
3. Create `src/instruments/<primitive>/<slug>/`:
   - `meta.ts`: `purpose` (one sentence shown above the tool), `primaryLabel` (what `C` copies), `related` slugs.
   - `Tool.svelte`: renders `.surface` and `.panel` as top-level elements. Reads state from its `initial` prop, reports changes with `setQuery(serialize(state))`, marks copyable values with `Copy` (and the primary one with `primary`).
   - `explain.md`: front matter `title` and `description`, then exactly four `##` sections: What it measures, How it is computed, When to use it, Related. 120 to 220 words each.
4. Add `src/pages/<primitive>/<slug>.astro`, copying `src/pages/color/contrast.astro`.

The instrument goes live everywhere (index, spotlight, related lists, sitemap, llms.txt) once `meta.ts` exists. The definition of done is in `design/README.md`.
