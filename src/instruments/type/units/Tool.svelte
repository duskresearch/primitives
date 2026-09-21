<script lang="ts" module>
  import type { TrackingUnit, Unit } from '@duskresearch/primitives/design/type';

  export interface UnitsOwn {
    value: number;
    unit: Unit;
    to: Unit;
    root: number;
    context: number;
    track: number;
    trackUnit: TrackingUnit;
  }
</script>

<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import NumberField from '@/components/tool/NumberField.svelte';
  import Select from '@/components/tool/Select.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { convertLength, trackingEm, TRACKING_UNITS, UNITS } from '@duskresearch/primitives/design/type';
  import { familyFor, type Font } from '../fonts';
  import { serializeWith, type TypeState } from '../state';

  // seed: the chosen face, from the page, so the sample loads without the full list.
  let { initial, own, seed }: { initial: TypeState; own: UnitsOwn; seed?: Font } = $props();
  // svelte-ignore state_referenced_locally
  const shared = initial;
  // svelte-ignore state_referenced_locally
  let s = $state<UnitsOwn>({ ...own });

  const unitNames: Record<Unit, string> = { px: 'px', rem: 'rem', em: 'em', pt: 'pt', '%': '%' };
  const trackNames: Record<TrackingUnit, string> = { percent: '% (Figma)', thousandths: '/1000 em (Adobe)', px: 'px', em: 'em' };

  const all = $derived(convertLength(s.value, s.unit, s.root, s.context));
  const shown = (u: Unit) => `${all[u]}${u}`;
  const em = $derived(trackingEm(s.track, s.trackUnit, all.px));
  const letterSpacing = $derived(`letter-spacing: ${em}em;`);

  let family = $state('var(--font-hanken), sans-serif');
  $effect(() => void familyFor(shared.font, seed).then((f) => (family = f)));

  let loaded = false;
  $effect(() => {
    const query = serializeWith(shared, { ...s });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface">
  <p class="labels mono">{s.value}{s.unit} at a {s.root}px root{s.unit === 'em' || s.unit === '%' || s.to === 'em' || s.to === '%' ? `, ${s.context}px context` : ''}</p>
  <p class="sample" style:font-family={family} style:font-size={`${Math.min(all.px, 160)}px`} style:letter-spacing={`${em}em`}>{shared.text}</p>
  <div class="result">
    <span class="mono label">as <Select bind:value={s.to} options={UNITS} names={unitNames} label="Convert to" /></span>
    <Copy value={shown(s.to)} label={s.to} primary class="big">{shown(s.to)}</Copy>
  </div>
</div>

<div class="panel">
  <div class="group">
    <p class="mono head">Length</p>
    <div class="line">
      <NumberField label="" name="Value" value={s.value} min={-10000} max={10000} places={3} onchange={(n) => (s.value = n)} />
      <Select bind:value={s.unit} options={UNITS} names={unitNames} label="Unit" />
    </div>
    <div class="pair">
      <NumberField label="Root" name="Root size in px" value={s.root} min={1} max={100} places={2} onchange={(n) => (s.root = n)} />
      <NumberField label="Context" name="Context size in px, for em and %" value={s.context} min={1} max={1000} places={2} onchange={(n) => (s.context = n)} />
    </div>
  </div>
  <div class="rows">
    {#each UNITS as u (u)}
      <div class="row"><span>{u}</span><Copy value={shown(u)} label={u}>{shown(u)}</Copy></div>
    {/each}
  </div>
  <div class="group">
    <p class="mono head">Tracking</p>
    <div class="line">
      <NumberField label="" name="Tracking" value={s.track} min={-1000} max={1000} places={2} onchange={(n) => (s.track = n)} />
      <Select bind:value={s.trackUnit} options={TRACKING_UNITS} names={trackNames} label="Tracking unit" />
    </div>
  </div>
  <div class="rows end">
    <div class="row"><span>CSS</span><Copy value={letterSpacing} label="letter-spacing">{letterSpacing}</Copy></div>
  </div>
</div>

<style>
  .labels {
    font-size: 11px;
    color: var(--ink-2);
  }
  .sample {
    overflow: hidden;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }
  .result {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .label {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 11px;
    color: var(--ink-2);
  }
  .surface {
    background: var(--paper-2);
    border: 1px solid var(--line-2);
  }
  .surface :global(.big) {
    font-size: 44px;
    line-height: 1.05;
    font-weight: 300;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .head {
    font-size: 11px;
    color: var(--ink-2);
  }
  .line {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }
  .line > :global(:first-child) {
    flex: 1;
  }
  .pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .rows {
    margin-top: 0;
  }
  .rows.end {
    margin-top: auto;
  }
  @media (max-width: 719px) {
    .surface :global(.big) {
      font-size: 28px;
      line-height: 1.1;
      font-weight: 400;
      letter-spacing: -0.02em;
    }
  }
</style>
