<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import NumberField from '@/components/tool/NumberField.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { currentQuery, setQuery } from '@/lib/client/harness';
  import { blob } from '@duskresearch/primitives/design/shape';
  import ShapeColorControls from '../ShapeColorControls.svelte';
  import { serializeWith, type ShapeState } from '../state';
  let { initial, own }: { initial: ShapeState; own: {seed:number;complexity:number;irregularity:number} } = $props();
  // svelte-ignore state_referenced_locally
  let shared = $state({...initial});
  // svelte-ignore state_referenced_locally
  let s = $state({...own});
  const answer = $derived(blob({...shared,...s}));
  let loaded=false;
  $effect(()=>{const query=serializeWith(shared,s);if(loaded)setQuery(query);loaded=true});
  function newSeed(){
    const seed=(s.seed+0x9e3779b9)>>>0;
    setQuery(serializeWith(shared,{...s,seed}));
    history.replaceState(history.state,'',`${location.pathname}${currentQuery()?`?${currentQuery()}`:''}`);
    s.seed=seed;
  }
</script>
<div class="surface">
  <div class="blob-preview"><svg viewBox="0 0 100 100" role="img" aria-label="Seeded blob preview" fill={shared.foreground}><path d={answer.path}/></svg></div>
  <p class="note">Mulberry32 · same seed, same path</p>
  <div class="block"><p>SVG path data</p><Copy value={answer.path} label="SVG path" primary class="code">{answer.path}</Copy></div>
</div>
<div class="panel">
  <ShapeColorControls bind:foreground={shared.foreground}/>
  <div class="seed"><NumberField label="Seed" name="Seed" value={s.seed} min={0} max={4294967295} onchange={(n)=>s.seed=Math.round(n)}/><button type="button" onclick={newSeed}>New seed</button></div>
  <Slider group="Number of radial control points" label="Points" bind:value={s.complexity} min={3} max={12} step={1} format={String}/>
  <Slider group="Irregularity" label="Variety" bind:value={s.irregularity} min={0} max={0.35} step={0.01} format={(n)=>n.toFixed(2)}/>
  <Slider group="Shared circumradius" label="Radius" bind:value={shared.radius} min={1} max={50} step={1} format={String}/>
  <Slider group="Shared rotation" label="Turn" bind:value={shared.rotation} min={0} max={359} step={1} format={(n)=>`${n}°`}/>
  <div class="block"><p>Standalone SVG</p><Copy value={answer.svg} label="blob SVG" class="code">{answer.svg}</Copy></div>
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);gap:14px}.blob-preview{flex:1;display:grid;place-items:center;min-height:160px}.blob-preview svg{width:min(100%,230px);height:230px;max-height:35vh}.note{font:11px var(--mono);color:var(--ink-2)}.surface :global(.code),.panel :global(.code){max-height:75px;text-align:left;overflow:auto}.seed{display:flex;gap:12px;align-items:center}.seed :global(.number){flex:1}.seed button{border:1px solid var(--line-2);background:var(--paper);padding:6px;color:var(--ink);cursor:pointer}.panel :global(.slider){grid-template-columns:50px minmax(0,1fr) 43px}
</style>
