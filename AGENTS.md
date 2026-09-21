# Building the rest of Primitives

Color and Type are live. This file is the handover for whoever builds the other eleven
primitives. `CLAUDE.md` holds the rules that are easy to break and is not repeated here:
read it first, then this.

## Where things stand

- 13 primitives, 50 instruments, all named in `src/data/catalogue.json`.
- Live: **Color** (Pick, Scale, Contrast, Harmony, Convert, Blend) and **Type** (Scale,
  Specimen, Measure, Units, Fallback). Eleven of fifty.
- **Ready to build: Grid (4), Shape (5), Motion (5).** These carry a full spec in the
  catalogue: `does`, `pain`, `primaryValue`, `keywords`, the primitive's `intro`, its mark,
  and the shared URL state under `state`.
- **Copy still to write: Space, Light, Noise, Ratio, Pattern, Icon, Random, State**
  (23 instruments). They have a name, a mark and one line of `does`. The `pain`,
  `primaryValue`, `keywords`, the primitive's `intro` and its shared `state` are yours to
  write, from the pattern the five finished primitives set. See "Writing a primitive's
  copy". Amrith reads it when the primitive is ready and will cut and rewrite; that is the
  process working, not a failure.
- A primitive's instruments can only go live once its `status` in the catalogue is
  `shipped`. Grid, Shape and Motion already are. Until an instrument has a `meta.ts` it
  shows as "In preparation" everywhere, which is the correct resting state.

## Read before building

- `CLAUDE.md` in this repo: the rules. The URL is the only state, every value copies
  itself, instrument pages render on demand, tool first and text second, plain American
  English, no dark mode, logic in `packages/primitives` and never in a Tool.
- `primitives-design/README.md` in Amrith's private explorations repo (`~/explorations`):
  the brief and the definition of done, with `FIELDS.md` (how a second field would work)
  and `MARK.md` (the mark). `update-for-claude-design.md` in the same folder records every
  decision that changed the brief while Color and Type were built. Read it: it will save
  you from re-litigating settled questions.
- The two built primitives are the reference implementation. `src/instruments/color` shows
  a primitive whose instruments share one piece of state and a format menu.
  `src/instruments/type` shows one with a data file, a server seed and lazy loading.

## The working agreement

You own the build. Amrith holds final taste authority and reviews at one checkpoint per
primitive, not per instrument. Keep the loop short and do not stack up questions.

- Per primitive: math with tests first, then one instrument end to end, then the rest. The
  first one built settles the layout and the copy voice for the other three or four.
- One checkpoint: a screenshot sheet of every instrument in the primitive at 1280x800 and
  390x844, with the copy you wrote for it. Ship after he says so.
- Commit locally as soon as the checks pass. Ask before pushing and before deploying.
  Never leave a primitive uncommitted overnight.
- Small, obvious, zero-risk fixes to something already live can go straight out.

**Decide these yourself:** the copy, within the voice; which familiar interface an
instrument starts from; the math and its tests; data sources, as long as no request goes to
a third party at runtime; anything that follows a pattern Color or Type already set.

**Ask first:** anything that changes the shared harness or `tool.css`; a new interaction
pattern nothing else uses; a new runtime dependency; an output that is not a copy, such as
Favicon's zip; storage of any kind; a schema change; deploying or pushing.

## Start from the interface people already know

This is how Color and Type were built and it is the difference between a tool people
understand in five seconds and one they have to learn. Take the interface that already
exists in the world, then make ours better at the one thing it is for. Never ship a
control nobody has seen before when a familiar one fits.

**Grid.** Columns: Figma's layout grid panel, with live reflow and real `grid-template-columns`
out. Breakpoints: Tailwind's default table is what people have in their heads; let them drag
a frame and see which range applies, and answer "why 768" with the device widths behind it.
Baseline: a rhythm overlay over real text, with the line heights that land on it. Layout: the
`grid-template-areas` builders, but opening from the skeletons people actually rebuild
(header and sidebar, holy grail, dashboard).

**Shape.** Form: the SVG shape generators, except the path that comes out is clean.
Corner: Figma's corner smoothing slider and the iOS squircle, both drawn over each other, out
as CSS (cite `corner-shape` in CSS Borders 4) or a path. Polygon: Clippy, which is the
clip-path interface everyone has used. Blob: blobmaker, with the seed in the URL so a blob
can be sent. Favicon: RealFaviconGenerator's job, from one mark. Favicon returns a zip, the
only instrument in the catalogue whose answer is a download rather than a copy. Settle that
with Amrith before building it.

**Motion.** Ease: cubic-bezier.com, but playing beside linear so the curve means something.
Spring: the spring controls from Framer and react-spring (mass, stiffness, damping), and
the part we do better is the CSS `linear()` approximation people cannot write by hand.
Duration: Material's guidance that distance and size set duration, so nothing is 300ms by
default. Stagger: the stagger control from GSAP and Framer, showing the list move. Export:
one curve written as CSS, Framer Motion and SwiftUI.

## Writing a primitive's copy

Five primitives are written. Read all of their entries in `catalogue.json` before you write
a word of a sixth, and match them. Every field has a shape.

**`does`**, four to ten words. A noun phrase naming what you get, usually ending in the form
it comes in. Never a verb aimed at the reader, never "helps you", never a feature list.

> "Even tints and shades from one color" · "A modular type ramp with line heights, as
> clamp() CSS" · "Columns, gap and margin with live reflow, as CSS" · "Parametric shapes
> exported as clean SVG"

**`pain`**, one sentence, present tense: the moment someone goes looking for this. Write the
situation, not the feeling, and never name the instrument as the cure. It reads on its own
on the primitive index and again after "for when" in `llms.txt`, so it has to work both
ways. If a pain starts with a name, add that name to the list in `src/pages/llms.txt.ts`,
which otherwise lowercases the first word.

> "You are not sure the gray text passes" · "Nobody remembers why 768 and 1024" ·
> "cubic-bezier numbers mean nothing until you see them move" · "Text jumps when the
> webfont arrives"

**`primaryValue`**, the answer the `C` key copies, as a lowercase noun phrase. Name the
thing, not the button: "ratio", "grid CSS", "max-width in ch", "clip-path", "ms". Where the
value follows a format the reader chose, say so: "the palette, in your format".

**`keywords`**, lowercase, what someone would actually type, including the format names, the
standard, and the words other tools use: "px to rem pt em tracking letter-spacing".

**`intro`**, exactly two sentences for the primitive's page. The first says what the
primitive is, as a claim about the world that a designer would nod at, with one idea in it
and no hedging. The second says how many instruments there are and what they cover.

> "A grid is a decision made once so that a hundred small decisions do not have to be
> made later." then "Four instruments for dividing space: columns and gaps as real CSS,
> breakpoints you can test, a baseline overlay, and common page skeletons."

**`state`**, the two to four values every instrument in the primitive carries in the URL.
Only what more than one instrument needs: Color carries two colors, Type carries base,
ratio, face and sample text. Instrument-only settings stay in that instrument's own params.

**`meta.ts`**: `purpose` is one sentence above the tool, longer than `does` and saying what
it is for; `primaryLabel` is the word in "Copied ...", so it reads as a thing, not a
setting.

The voice: plain American English, objective, never first person. No em-dashes. Never
beautiful, premium or delightful. Explanations cite the standard they follow, by name and
number, because that is what makes them worth reading. Read every line aloud before you
commit it; if it sounds like marketing, cut it until it sounds like a colleague.

## The recipe

Per primitive, once:

1. Catalogue: write the copy if it is not there yet (see above), then set `status` to
   `shipped`. The mark and `hue` already exist for all thirteen.
2. `packages/primitives/src/design/<primitive>/index.ts`: the math. Pure functions, one
   plain object in and one out, no DOM and no I/O, `InputError` on bad input, and an
   `operations` object keyed by instrument slug. Tests beside it in `<primitive>.test.ts`.
   Keep UI words out: return `direction: 'darken'` and let the tool say "Darken".
3. `src/instruments/<primitive>/state.ts` and `defaults.ts`: the shared state every
   instrument in that primitive carries in the URL, its serializer, and the parse with
   defaults and clamping. The shape is specified in the catalogue's `state`.

Per instrument:

4. `src/instruments/<primitive>/<slug>/meta.ts`: `purpose`, `primaryLabel`, `related`.
5. `src/instruments/<primitive>/<slug>/Tool.svelte`: renders `.surface` and `.panel` as its
   two top-level elements. Reads `initial` (and `own`) from props, reports state with
   `setQuery(serializeWith(...))`, wraps every value in `Copy` and marks one `primary`.
6. `src/instruments/<primitive>/<slug>/explain.md`: front matter `title` and `description`,
   then exactly four sections: What it measures, How it is computed, When to use it,
   Related. Keep each to 120 to 140 words and cite the standard (a WCAG success criterion,
   a CSS spec, the OpenType spec, a named method).
7. `src/pages/<primitive>/<slug>.astro`: copy `src/pages/type/measure.astro`. It parses the
   URL in a `read(q)` function, passes `query` and `defaults` (the same `read` on empty
   params) to the Instrument layout, and hands the tool anything the first render needs.

An instrument goes live everywhere (index, search, related lists, sitemap, llms.txt) the
moment its `meta.ts` exists. There is nothing else to register.

## The harness, in one paragraph

`src/layouts/Instrument.astro` draws the page: breadcrumb, title, the tool region, the
explanation, related instruments. It takes `primitive`, `slug`, `query` and `defaults`.
`src/styles/tool.css` styles `.surface`, `.panel`, `.rows`, `.row`, `.block` and `.code`;
use those class names and write as little CSS as possible. Shared controls live in
`src/components/tool/`: `Copy`, `Choice`, `Select`, `Slider`, `NumberField`, `FormatSelect`,
`Swatches`. `setQuery` in `src/lib/client/harness.ts` mirrors state into the address bar,
the header's copy link and sibling links, leaving out anything at its default. Copies
confirm themselves with a stamp at the pointer and in the footer status slot; you never
call that yourself, the site-wide click handler does.

## Definition of done

1. `npm test && npm run check && npm run build`, all clean.
2. The tool is visible above the fold at 1280x800 and 390x844, and nothing overflows
   sideways at 390.
3. No console errors, and no network requests to anything that is not ours.
4. Under 60 kB of gzipped JavaScript per page.
5. Lighthouse on mobile: accessibility 100, performance median at least 95 over three runs.
6. Every value on screen copies, and the primary one answers the instrument's question.
7. The screenshot sheet, then Amrith's approval.

## How to measure

`npx astro preview` serves files uncompressed, which makes Lighthouse punish a page for
bytes production never sends. Run `node scripts/gzip-preview.mjs` (no dependencies) and
point Lighthouse and Playwright at `http://localhost:4323` instead. Type's pages measured
81 to 96 through the raw preview and 99 through the proxy, which is what production scores.
Playwright and Lighthouse are not dependencies of this repo. Run them with `npx` from a
scratch directory so the repo stays lean.

## Gotchas that cost time

- `.row` is a global class in `tool.css`. Naming a list row `.row` inside a tool silently
  inherits a two-column grid and wrecks the layout. Name tool-local classes something else.
- Grid items must not be widened by their content. `tool.css` sets `min-width: 0` on
  `.surface` and `.panel` for this reason; one line of `white-space: pre` code will
  otherwise push a column past the viewport.
- `export interface` is not allowed in a Svelte instance script. Put it in `<script module>`.
- Range inputs are one way: `value` plus `oninput`. Binding them two way snaps URL state to
  the step grid on hydration.
- Anything a tool needs for its first render must come from the page as a prop. Fetching it
  on hydration pushes out the largest paint. Type's pages do this through
  `src/instruments/type/seed.ts`, which is server only by design.
- Never call a Window method detached from `window`. Firefox refuses
  `(window.requestIdleCallback ?? setTimeout)(fn)`.
- `astro dev` sometimes serves a component's previous stylesheet after an edit. Save again
  or restart before believing what you see. Production builds are unaffected.
- `astro preview` runs as a daemon. `npx astro preview stop` before starting a new one, or
  you will test a stale build and chase ghosts.
- Do not reformat `catalogue.json` wholesale. Edit the strings you mean to edit.
- The redirect workers in `workers/` deploy with `npx wrangler deploy --config wrangler.jsonc`
  from their own folder.

## Never

- Never put instrument logic in a Tool, or DOM and I/O in `packages/primitives`.
- Never add storage of any kind. The URL is the state. The consent choice is the one
  exception that already exists.
- Never hard-code a token or a piece of catalogue copy. `src/styles/tokens.css` is
  generated; edit `src/data/tokens.json` and run `npm run tokens`.
- Never edit an applied migration. Add a new file in `migrations/`.
- Never write the mark by hand or type the glyph. It comes from `src/lib/logo.ts`.
- Never use an em-dash, and never call anything beautiful, premium or delightful.
