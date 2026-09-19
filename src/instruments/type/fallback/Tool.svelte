<script lang="ts" module>
  export interface FallbackOwn {
    fb: string;
    view: 'adjusted' | 'plain';
  }
</script>

<script lang="ts">
  import Choice from '@/components/tool/Choice.svelte';
  import Copy from '@/components/tool/Copy.svelte';
  import Select from '@/components/tool/Select.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { fallbackCss, overridesFor, type Overrides } from '@duskresearch/primitives/design/type';
  import FontField from '../FontField.svelte';
  import { familyFor, loadFonts, localSystem, type Font, type SystemFont } from '../fonts';
  import { serializeWith, type TypeState } from '../state';

  // seed: the chosen face and the system fonts, from the page, so the measurements and the
  // CSS arrive in the HTML.
  let { initial, own, seed }: { initial: TypeState; own: FallbackOwn; seed: { font?: Font; system: SystemFont[] } } = $props();
  // svelte-ignore state_referenced_locally
  let t = $state<TypeState>({ ...initial });
  // svelte-ignore state_referenced_locally
  let s = $state<FallbackOwn>({ ...own });

  // svelte-ignore state_referenced_locally
  let system = $state<SystemFont[]>(seed.system);
  // svelte-ignore state_referenced_locally
  let font = $state<Font | undefined>(seed.font);
  $effect(() => {
    const id = t.font;
    if (font?.id === id) return;
    loadFonts().then((d) => {
      system = localSystem(d.system);
      font = d.byId.get(id);
    });
  });
  const fallback = $derived(system.find((f) => f.family === s.fb) ?? system[0]);
  const overrides = $derived<Overrides | null>(font?.metrics && fallback ? overridesFor(font.metrics, fallback.metrics) : null);
  const css = $derived(font && fallback && overrides ? fallbackCss(font.family, fallback.family, overrides, font.category) : '');

  let family = $state('var(--font-hanken), sans-serif');
  $effect(() => void familyFor(t.font, font).then((f) => (family = f)));

  // The fallback as the browser will draw it, with and without the overrides; rendered in the
  // markup so the overlay is right before hydration. Family names come from the system list.
  const faces = $derived.by(() => {
    if (!fallback) return '';
    const o = overrides;
    return `<style>@font-face{font-family:"pf-fallback-plain";src:local("${fallback.family}")}${
      o ? `@font-face{font-family:"pf-fallback-adjusted";src:local("${fallback.family}");size-adjust:${o.sizeAdjust}%;ascent-override:${o.ascentOverride}%;descent-override:${o.descentOverride}%;line-gap-override:${o.lineGapOverride}%}` : ''
    }</style>`;
  });

  const views = { adjusted: 'Adjusted', plain: 'As it comes' } as const;
  const sample = $derived(`${t.text}. Text set in the fallback first, then in the webfont, should not move when the webfont arrives.`);

  let loaded = false;
  $effect(() => {
    const query = serializeWith(t, { ...s });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface">
  {@html faces}
  <p class="labels mono">
    <span><i class="key-web"></i>{font?.family ?? 'Webfont'}</span>
    <span><i class="key-fallback"></i>{fallback?.family ?? 'Fallback'}, {s.view === 'adjusted' ? 'adjusted' : 'as it comes'}</span>
  </p>
  <div class="overlay">
    <p class="web" style:font-family={family}>{sample}</p>
    <p class="fallback" style:font-family={s.view === 'adjusted' ? '"pf-fallback-adjusted"' : '"pf-fallback-plain"'} aria-hidden="true">{sample}</p>
  </div>
  <p class="mono note">Where the two lines part, text will jump when the webfont loads.</p>
</div>

<div class="panel">
  <FontField bind:font={t.font} label="Webfont" known={seed.font} />
  {#if system.length}
    <div class="line">
      <span class="mono key">Fallback</span>
      <Select bind:value={s.fb} options={system.map((f) => f.family)} names={Object.fromEntries(system.map((f) => [f.family, f.family]))} label="Fallback font" />
    </div>
  {/if}
  <Choice label="Preview" options={['adjusted', 'plain'] as const} names={views} bind:value={s.view} />
  {#if overrides}
    <div class="rows">
      <div class="row"><span>size-adjust</span><span>{overrides.sizeAdjust}%</span></div>
      <div class="row"><span>ascent-override</span><span>{overrides.ascentOverride}%</span></div>
      <div class="row"><span>descent-override</span><span>{overrides.descentOverride}%</span></div>
      <div class="row"><span>line-gap-override</span><span>{overrides.lineGapOverride}%</span></div>
    </div>
  {/if}
  <div class="block end">
    <p>CSS</p>
    <Copy value={css} label="@font-face" primary class="code">{css || 'Loading measurements'}</Copy>
  </div>
</div>

<style>
  .surface {
    background: var(--paper-2);
    border: 1px solid var(--line-2);
  }
  .labels {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 20px;
    font-size: 11px;
    color: var(--ink-2);
  }
  .labels i {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 8px;
  }
  .key-web {
    background: var(--ink);
  }
  .key-fallback {
    background: var(--fail);
  }
  .overlay {
    position: relative;
  }
  .overlay p {
    font-size: 24px;
    line-height: 1.5;
  }
  .web {
    color: var(--ink);
  }
  .fallback {
    position: absolute;
    inset: 0;
    color: var(--fail);
    mix-blend-mode: multiply;
  }
  .note {
    font-size: 11px;
    color: var(--ink-2);
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
  .rows {
    margin-top: 0;
  }
  .end {
    margin-top: auto;
  }
  @media (max-width: 719px) {
    .overlay p {
      font-size: 19px;
    }
  }
</style>
