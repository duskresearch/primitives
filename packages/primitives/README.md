# @duskresearch/primitives

The logic behind the [primitiv.es](https://primitiv.es) instruments, namespaced by field and then one module per primitive: `design/color`, `design/type`, `design/grid`, `design/shape`, `design/motion`. Design is the only field so far; a second one gets its own namespace beside it. The site's islands use it today. The same functions are meant to become JSON endpoints (`/api/<primitive>/<instrument>`) and a published npm package, so agents and coding assistants can call Primitives instead of guessing. Neither exists yet; the package is private.

## The contract

Every operation (see `src/operation.ts`):

- takes one plain object and returns one, both unchanged by `JSON.stringify`;
- touches no DOM, network, clock or unseeded randomness, so it runs the same in a browser, a Worker or Node;
- throws `InputError` with a readable message on bad input, which an endpoint maps to a 400.

Each primitive module exports `operations`, keyed by instrument slug, so an endpoint can dispatch generically: `operations[instrument](input)`. Building blocks (conversions, ratios) are exported beside them for the site's own tools.

```ts
import { contrast } from '@duskresearch/primitives/design/color';

contrast({ text: '#999', background: 'white' });
// { text: { hex: '#999999', oklch: {…} }, background: {…}, ratio: 2.84, grade: 'Fails',
//   passes: { bodyAA: false, largeAA: false, bodyAAA: false, largeAAA: false },
//   fix: { text: { hex: '#757575', … }, ratio: 4.59, direction: 'darken' } }
```

## Adding an instrument's logic

Put it in its primitive's module (`src/<field>/<primitive>/`), add the operation to `operations` under the instrument's slug, and test it next to the module (`*.test.ts`, run by `npm test` at the repo root). Keep UI copy out: return data (`direction: 'darken'`), let the tool word it.

## Before publishing

Exports point at TypeScript sources, which the site's bundler compiles. Publishing needs a build step that emits JavaScript and type declarations, a license, and a version.
