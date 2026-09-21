<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {grain} from '@duskresearch/primitives/design/noise';
  import {setQuery} from '@/lib/client/harness';
  import NoiseControls from '../NoiseControls.svelte';
  import {serializeWith,type NoiseState} from '../state';
  let {initial,own}:{initial:NoiseState;own:{frequency:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<NoiseState>({...initial});
  // svelte-ignore state_referenced_locally
  let frequency=$state(own.frequency);
  const answer=$derived(grain({...s,frequency}));
  const preview=$derived(`data:image/svg+xml,${encodeURIComponent(answer.svg)}`);
  let loaded=false;$effect(()=>{const q=serializeWith(s,{frequency});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><div class="preview"><img src={preview} width="256" height="256" alt="Seeded SVG grain over selected background"/></div><div class="block"><p>Complete SVG with filter source</p><Copy value={answer.svg} label="grain SVG" primary class="code">{answer.svg}</Copy></div></div>
<div class="panel"><NoiseControls bind:value={s}/><Slider group="Noise frequency" label="Freq" bind:value={frequency} min={.01} max={1} step={.01} format={(n)=>n.toFixed(2)}/><p class="mono note">SVG feTurbulence uses the URL seed. Browser filter rendering can differ; no pixel field is generated during render.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.preview{flex:1;display:grid;place-items:center;min-height:150px}.preview img{max-width:100%;max-height:250px;width:auto;height:auto}.surface :global(.code){max-height:110px;text-align:left;overflow:auto}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}</style>
