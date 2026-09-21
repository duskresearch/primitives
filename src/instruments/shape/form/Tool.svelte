<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { FORMS, form } from '@duskresearch/primitives/design/shape';
  import { serializeWith, type ShapeState } from '../state';
  let { initial, own }: { initial: ShapeState; own: { inner: number } } = $props();
  // svelte-ignore state_referenced_locally
  let s = $state<ShapeState>({ ...initial });
  // svelte-ignore state_referenced_locally
  let inner = $state(own.inner);
  const answer = $derived(form({ ...s, inner }));
  const preview = $derived(`data:image/svg+xml,${encodeURIComponent(answer.svg)}`);
  let loaded = false;
  $effect(() => { const query = serializeWith(s, { inner }); if (loaded) setQuery(query); loaded = true; });
</script>
<div class="surface">
  <div class="shape-preview"><img src={preview} width="230" height="230" alt={`${s.form} preview`} /></div>
  <p class="mono note">100 × 100 viewBox · radius from center to outer edge</p>
  <div class="block"><p>Standalone SVG</p><Copy value={answer.svg} label="SVG" primary class="code">{answer.svg}</Copy></div>
</div>
<div class="panel">
  <Choice label="Form" options={FORMS} names={{circle:'Circle',square:'Square',triangle:'Triangle',ngon:'Polygon',star:'Star'}} bind:value={s.form}/>
  <Slider group="Circumradius" label="Radius" bind:value={s.radius} min={1} max={50} step={1} format={(n)=>`${n}`}/>
  <Slider group="Rotation in degrees" label="Turn" bind:value={s.rotation} min={0} max={359} step={1} format={(n)=>`${n}°`}/>
  {#if s.form === 'ngon' || s.form === 'star'}<Slider group="Number of sides" label="Sides" bind:value={s.sides} min={3} max={12} step={1} format={String}/>{/if}
  {#if s.form === 'star'}<Slider group="Inner radius ratio" label="Inner" bind:value={inner} min={0.1} max={0.9} step={0.01} format={(n)=>n.toFixed(2)}/>{/if}
  <div class="rows"><div class="row"><span>SVG element</span><Copy value={answer.element} label="SVG element">Copy element</Copy></div></div>
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);gap:14px}
  .shape-preview{flex:1;display:grid;place-items:center;min-height:160px}.shape-preview img{width:min(100%,230px);height:auto;max-height:35vh}
  .note{font-size:11px;color:var(--ink-2)}.surface :global(.code){max-height:75px;text-align:left;overflow:auto}
  .panel :global(.slider){grid-template-columns:48px minmax(0,1fr) 45px}
</style>
