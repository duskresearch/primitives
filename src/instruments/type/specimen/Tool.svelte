<script lang="ts" module>
  export const SORTS = ['popular', 'trending', 'newest', 'name', 'xheight', 'narrow'] as const;
  export const CATEGORIES = ['all', 'sans', 'serif', 'display', 'handwriting', 'mono'] as const;
  export const EMBEDS = ['google', 'self', 'npm', 'css'] as const;
  export const LANGUAGES = ['any', 'latin-ext', 'vietnamese', 'cyrillic', 'greek', 'arabic', 'hebrew', 'devanagari', 'thai', 'japanese', 'korean', 'chinese-simplified'] as const;

  export interface SpecimenOwn {
    size: number;
    weight: number;
    view: 'picks' | 'all';
    sort: (typeof SORTS)[number];
    cat: (typeof CATEGORIES)[number];
    lang: (typeof LANGUAGES)[number];
    vf: boolean;
    it: boolean;
    q: string;
    pins: string[];
    embed: (typeof EMBEDS)[number];
  }
</script>

<script lang="ts">
  import Choice from '@/components/tool/Choice.svelte';
  import Copy from '@/components/tool/Copy.svelte';
  import Select from '@/components/tool/Select.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { setQuery } from '@/lib/client/harness';
  import picks from '@/data/type-picks.json';
  import { embeds, pairingsFor, widthRatio, xHeightRatio } from '@duskresearch/primitives/design/type';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import { afterLoad, faceFor, genericFor, loadFonts, loadFontsSoon, type Font } from '../fonts';
  import { TEXT_MAX, serializeWith, type TypeState } from '../state';

  // seed: the faces the first render shows (the shelf, pins, the chosen face and its pairs),
  // from the page, so the HTML arrives complete; the full list follows after hydration.
  let { initial, own, seed }: { initial: TypeState; own: SpecimenOwn; seed: { fonts: Font[]; pairs: string[] } } = $props();
  // svelte-ignore state_referenced_locally
  let t = $state<TypeState>({ ...initial });
  // svelte-ignore state_referenced_locally
  let s = $state<SpecimenOwn>({ ...own, pins: [...own.pins] });

  let fonts = $state<Font[]>([]);
  // svelte-ignore state_referenced_locally
  let byId = $state(new Map(seed.fonts.map((f) => [f.id, f])));
  // At once when the view needs every family or a new face needs its pairs; otherwise when idle.
  $effect(() => {
    const now = s.view === 'all' || t.font !== initial.font;
    void (now ? loadFonts() : loadFontsSoon()).then((d) => {
      fonts = d.fonts;
      byId = d.byId;
    });
  });

  // ── The list: the shelf, or every family filtered and sorted ─────────────────────────
  const PAGE = 60;
  let limit = $state(PAGE);
  const filtered = $derived.by(() => {
    const q = s.q.trim().toLowerCase();
    const list = fonts.filter(
      (f) =>
        (s.cat === 'all' || f.category === s.cat) &&
        (!s.vf || f.variable) &&
        (!s.it || f.italic) &&
        (s.lang === 'any' || f.subsets.includes(s.lang)) &&
        (!q || f.family.toLowerCase().includes(q) || f.designers.some((d) => d.toLowerCase().includes(q))),
    );
    const x = (f: Font) => (f.metrics ? xHeightRatio(f.metrics) : 0);
    const w = (f: Font) => (f.metrics ? widthRatio(f.metrics) : 9);
    const by: Record<SpecimenOwn['sort'], (a: Font, b: Font) => number> = {
      popular: (a, b) => a.popularity - b.popularity,
      trending: (a, b) => a.trending - b.trending,
      newest: (a, b) => b.added.localeCompare(a.added),
      name: (a, b) => a.family.localeCompare(b.family),
      xheight: (a, b) => x(b) - x(a),
      narrow: (a, b) => w(a) - w(b),
    };
    return list.sort(by[s.sort]);
  });
  $effect(() => {
    void [s.q, s.cat, s.sort, s.lang, s.vf, s.it, s.view];
    limit = PAGE;
  });
  const shelf = $derived(picks.groups.map((g) => ({ name: g.name, fonts: g.ids.map((id) => byId.get(id)).filter((f): f is Font => Boolean(f)) })));
  const pinned = $derived(s.pins.map((id) => byId.get(id)).filter((f): f is Font => Boolean(f)));

  // ── Faces load as rows come into view, in the weight shown ───────────────────────────
  const families = new SvelteMap<string, string>();
  const visible = new SvelteSet<Font>();
  const key = (f: Font) => `${f.id}-${s.weight}`;
  let ready: Promise<void> | undefined;
  function load(f: Font) {
    const k = key(f);
    const weight = s.weight;
    if (families.has(k)) return;
    (ready ??= afterLoad()).then(() => {
      const face = faceFor(f, weight);
      face.ready.then(() => families.set(k, `${face.family}, ${genericFor(f.category)}`));
    });
  }
  $effect(() => {
    void s.weight;
    visible.forEach(load);
  });
  function seen(node: HTMLElement, f: Font) {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          visible.add(f);
          load(f);
        } else visible.delete(f);
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(node);
    return { destroy: () => (io.disconnect(), visible.delete(f)) };
  }
  function more(node: HTMLElement) {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (limit += PAGE), { rootMargin: '600px 0px' });
    io.observe(node);
    return { destroy: () => io.disconnect() };
  }

  function togglePin(id: string) {
    s.pins = s.pins.includes(id) ? s.pins.filter((p) => p !== id) : [...s.pins, id].slice(-4);
  }

  // ── The chosen face ───────────────────────────────────────────────────────────────────
  const chosen = $derived(byId.get(t.font));
  const pairs = $derived.by(() => {
    if (!chosen?.metrics) return [];
    const ids = fonts.length ? pairingsFor(chosen, fonts).map((c) => c.id) : t.font === initial.font ? seed.pairs : [];
    return ids.map((id) => byId.get(id)).filter((f): f is Font => Boolean(f));
  });
  const code = $derived.by(() => {
    if (!chosen) return '';
    const e = embeds({ id: chosen.id, family: chosen.family, weights: chosen.weights, italic: chosen.italic, variable: chosen.variable }, [...new Set([400, 700, s.weight])].sort((x, y) => x - y));
    return { google: e.google, self: e.import, npm: `${e.npm}\n${e.import}`, css: `${e.css.slice(0, -1)}, ${genericFor(chosen.category)};` }[s.embed];
  });
  const embedNames = { google: 'Google', self: 'Self-host', npm: 'npm', css: 'CSS' } as const;
  const categoryNames = { all: 'All', sans: 'Sans', serif: 'Serif', display: 'Display', handwriting: 'Hand', mono: 'Mono' } as const;
  const sortNames = { popular: 'Most used', trending: 'Trending', newest: 'Newest', name: 'A to Z', xheight: 'Largest x-height', narrow: 'Narrowest' } as const;
  const languageNames = Object.fromEntries(LANGUAGES.map((l) => [l, l === 'any' ? 'Any language' : l.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())])) as Record<(typeof LANGUAGES)[number], string>;
  const weightOptions = ['100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
  let weightText = $state(String(own.weight) as (typeof weightOptions)[number]);
  $effect(() => void (s.weight = Number(weightText)));
  const percent = (n: number) => `${Math.round(n * 100)}%`;

  let loaded = false;
  $effect(() => {
    const query = serializeWith(t, { size: s.size, weight: s.weight, view: s.view, sort: s.sort, cat: s.cat, lang: s.lang, vf: s.vf ? 1 : 0, it: s.it ? 1 : 0, q: s.q, pins: s.pins.join(','), embed: s.embed });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

{#snippet row(f: Font)}
  <li class="face" class:chosen={f.id === t.font} use:seen={f}>
    <div class="head mono">
      <button type="button" class="name" onclick={() => (t.font = f.id)} aria-pressed={f.id === t.font}>{f.family}</button>
      <span class="facts">{f.category === 'mono' ? 'mono' : f.category}{f.variable ? ' · variable' : ` · ${f.weights.length} weights`}{f.italic ? ' · italic' : ''}</span>
      <button type="button" class="pin" aria-pressed={s.pins.includes(f.id)} onclick={() => togglePin(f.id)}>{s.pins.includes(f.id) ? 'Pinned' : 'Pin'}</button>
    </div>
    <p class="sample" style:font-family={families.get(key(f)) ?? genericFor(f.category)} style:font-size={`${s.size}px`} style:font-weight={s.weight}>{t.text}</p>
  </li>
{/snippet}

<div class="surface list">
  {#if pinned.length}
    <section class="group">
      <h2 class="mono">Comparing</h2>
      <ol>{#each pinned as f (f.id)}{@render row(f)}{/each}</ol>
    </section>
  {/if}
  {#if s.view === 'picks'}
    {#each shelf as g (g.name)}
      <section class="group">
        <h2 class="mono">{g.name}</h2>
        <ol>{#each g.fonts as f (f.id)}{@render row(f)}{/each}</ol>
      </section>
    {/each}
  {:else if !fonts.length}
    <p class="mono status">Loading 1,946 families</p>
  {:else}
    <section class="group">
      <h2 class="mono">{filtered.length.toLocaleString('en-US')} families · {sortNames[s.sort]}</h2>
      {#if filtered.length}
        <ol>{#each filtered.slice(0, limit) as f (f.id)}{@render row(f)}{/each}</ol>
        {#if limit < filtered.length}<div class="more" use:more></div>{/if}
      {:else}
        <p class="mono status">No family matches what you are looking for. Try another spelling, or widen the filters.</p>
      {/if}
    </section>
  {/if}
</div>

<div class="panel">
  <div class="group-controls">
    <label class="text mono" for="specimen-text">
      <span>Your text</span>
      <input id="specimen-text" class="field" type="text" maxlength={TEXT_MAX} bind:value={t.text} autocomplete="off" />
    </label>
    <Slider group="Size" label="px" bind:value={s.size} min={12} max={120} step={1} format={(v) => `${v}px`} />
    <div class="line">
      <span class="mono key">Weight</span>
      <Select bind:value={weightText} options={weightOptions} names={Object.fromEntries(weightOptions.map((w) => [w, w])) as Record<(typeof weightOptions)[number], string>} label="Weight" />
    </div>
  </div>

  <Choice label="Show" options={['picks', 'all'] as const} names={{ picks: 'Our picks', all: 'All 1,946' }} bind:value={s.view} />
  {#if s.view === 'all'}
    <div class="group-controls">
      <label class="text mono" for="specimen-search">
        <span>Search</span>
        <input id="specimen-search" class="field" type="search" bind:value={s.q} placeholder="Family or designer" autocomplete="off" />
      </label>
      <div class="line"><span class="mono key">Sort</span><Select bind:value={s.sort} options={SORTS} names={sortNames} label="Sort" /></div>
      <Choice label="Category" options={CATEGORIES} names={categoryNames} bind:value={s.cat} />
      <div class="line"><span class="mono key">Language</span><Select bind:value={s.lang} options={LANGUAGES} names={languageNames} label="Language" /></div>
      <div class="checks mono">
        <label><input type="checkbox" bind:checked={s.vf} /> Variable</label>
        <label><input type="checkbox" bind:checked={s.it} /> Has italics</label>
      </div>
    </div>
  {/if}

  {#if chosen}
    <div class="chosen-face">
      <p class="mono key">Chosen</p>
      <p class="family">{chosen.family}</p>
      <div class="rows">
        {#if chosen.designers.length}<div class="row"><span>Designed by</span><span>{chosen.designers.join(', ')}</span></div>{/if}
        <div class="row"><span>Weights</span><span>{chosen.variable ? `${Math.min(...chosen.weights)} to ${Math.max(...chosen.weights)}, variable` : chosen.weights.join(', ')}{chosen.italic ? ', with italics' : ''}</span></div>
        {#if chosen.metrics}
          <div class="row"><span>x-height</span><span>{percent(xHeightRatio(chosen.metrics))} of the size</span></div>
          <div class="row"><span>Average width</span><span>{percent(widthRatio(chosen.metrics))} of the size</span></div>
        {/if}
        {#if chosen.added}<div class="row"><span>On Google Fonts</span><span>since {chosen.added.slice(0, 4)}, rank {chosen.popularity}</span></div>{/if}
      </div>
      {#if pairs.length}
        <p class="mono key">Pairs with</p>
        <div class="pairs">
          {#each pairs as p (p.id)}
            <button type="button" class="pair-button mono" onclick={() => togglePin(p.id)} aria-pressed={s.pins.includes(p.id)}>{p.family}</button>
          {/each}
        </div>
      {/if}
      <Choice label="Use it" options={EMBEDS} names={embedNames} bind:value={s.embed} />
      <Copy value={code} label={embedNames[s.embed]} primary class="code">{code}</Copy>
    </div>
  {:else}
    <p class="mono key">Choose a family by its name to see its details and embed code.</p>
  {/if}
</div>

<style>
  .surface.list {
    display: block;
    height: clamp(520px, 78vh, 860px);
    overflow-y: auto;
    padding: 0 24px 24px;
    background: var(--paper-2);
    border: 1px solid var(--line-2);
  }
  .status {
    padding-top: 24px;
    font-size: 11px;
    color: var(--ink-2);
  }
  .group h2 {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 16px 0 8px;
    background: var(--paper-2);
    font-size: 11px;
    font-weight: 400;
    color: var(--ink-2);
  }
  .face {
    padding: 14px 0 16px;
    border-top: 1px solid var(--line-2);
  }
  .face.chosen {
    box-shadow: inset 3px 0 0 var(--ink);
    padding-left: 12px;
  }
  .head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    font-size: 11px;
    color: var(--ink-2);
  }
  .name {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: var(--ink);
    cursor: pointer;
  }
  .name:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .facts {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .pin {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: var(--ink-2);
    cursor: pointer;
  }
  .pin[aria-pressed='true'] {
    color: var(--ink);
  }
  .sample {
    margin-top: 6px;
    overflow: hidden;
    line-height: 1.2;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--ink);
  }
  .more {
    height: 1px;
  }
  .group-controls,
  .chosen-face {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .text {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    font-size: 11px;
    color: var(--ink-2);
  }
  .text .field {
    flex: 1;
    max-width: 75%;
    padding: 5px 0;
    line-height: 1.25;
    border-bottom-color: var(--line-3);
    font-family: var(--mono);
    font-size: 11px;
    text-align: right;
    color: var(--ink);
  }
  .line {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  .key {
    font-size: 11px;
    color: var(--ink-2);
  }
  .checks {
    display: flex;
    gap: 20px;
    font-size: 11px;
    color: var(--ink);
  }
  .checks input {
    accent-color: var(--ink);
  }
  .family {
    font-size: 22px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: -0.02em;
  }
  .rows {
    margin-top: 0;
  }
  .pairs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
  }
  .pair-button {
    padding: 0;
    border: 0;
    background: none;
    font-size: 11px;
    color: var(--ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
  .pair-button[aria-pressed='true'] {
    text-decoration: none;
    color: var(--ink-2);
  }
  @media (pointer: coarse) {
    .name,
    .pin,
    .pair-button {
      min-height: var(--min-hit);
    }
    .text .field {
      min-height: 0;
    }
  }
  @media (max-width: 639px) {
    .surface.list {
      height: 70vh;
      padding: 0 16px 16px;
    }
  }
</style>
