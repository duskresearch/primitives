<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {tile} from '@duskresearch/primitives/design/pattern';
  import {setQuery} from '@/lib/client/harness';
  import PatternControls from '../PatternControls.svelte';
  import {serializeWith,type PatternState} from '../state';
  let {initial,own}:{initial:PatternState;own:{size:number;rotation:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<PatternState>({...initial});
  // svelte-ignore state_referenced_locally
  let size=$state(own.size),rotation=$state(own.rotation);
  const answer=$derived(tile({...s,size,rotation}));
  const preview=$derived(`data:image/svg+xml,${encodeURIComponent(answer.svg)}`);
  let loaded=false;$effect(()=>{const q=serializeWith(s,{size,rotation});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><div class="preview"><img src={preview} width={s.tileSize*4} height={s.tileSize*4} alt="Repeated geometric tile"/></div><div class="rows"><div class="row"><span>Motif width</span><Copy value={`${answer.motifSize}px`} label="motif size">{answer.motifSize}px</Copy></div><div class="row"><span>Clear gap</span><Copy value={`${answer.clearGap}px`} label="tile gap">{answer.clearGap}px</Copy></div></div><div class="block"><p>Self-contained repeat SVG</p><Copy value={answer.svg} label="pattern SVG" primary class="code">{answer.svg}</Copy></div></div>
<div class="panel"><PatternControls bind:value={s}/><Slider group="Motif size ratio" label="Size" bind:value={size} min={.1} max={.9} step={.01} format={(n)=>`${Math.round(n*100)}%`}/><Slider group="Motif rotation" label="Turn" bind:value={rotation} min={0} max={360} step={1} format={(n)=>`${n}°`}/><p class="mono note">Tile pitch and motif size set the clear gap. Edge-crossing motifs wrap into neighboring tiles.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.preview{flex:1;display:grid;place-items:center;min-height:140px;overflow:hidden}.preview img{max-width:100%;max-height:260px;width:auto;height:auto}.surface :global(.code){max-height:100px;text-align:left;overflow:auto}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}</style>
