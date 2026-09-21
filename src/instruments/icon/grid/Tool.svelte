<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {grid} from '@duskresearch/primitives/design/icon';
  import {setQuery} from '@/lib/client/harness';
  import IconControls from '../IconControls.svelte';
  import {serializeWith,type IconState} from '../state';
  let {initial,own}:{initial:IconState;own:{padding:number;guides:boolean}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<IconState>({...initial});
  // svelte-ignore state_referenced_locally
  let padding=$state(own.padding),guides=$state(own.guides);
  const safePadding=$derived(Math.min(padding,Math.floor(s.size/4)));
  const answer=$derived(grid({...s,padding:safePadding,guides}));
  const preview=$derived(`data:image/svg+xml,${encodeURIComponent(answer.svg)}`);
  let loaded=false;$effect(()=>{if(padding>Math.floor(s.size/4))padding=Math.floor(s.size/4);const q=serializeWith(s,{padding,guides});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><div class="preview"><img src={preview} width={s.size*8} height={s.size*8} alt={`${s.exemplar} on a ${s.size}px icon grid`}/></div><div class="rows"><div class="row"><span>viewBox</span><Copy value={`0 0 ${s.size} ${s.size}`} label="icon viewBox">0 0 {s.size} {s.size}</Copy></div><div class="row"><span>Keyline inset</span><Copy value={`${answer.inset}px`} label="icon keyline inset">{answer.inset}px</Copy></div></div><div class="block"><p>{guides?'SVG with guides':'Clean SVG'}</p><Copy value={answer.svg} label="icon SVG" primary class="code">{answer.svg}</Copy></div></div>
<div class="panel"><IconControls bind:value={s}/><Slider group="Icon padding" label="Pad" bind:value={padding} min={0} max={Math.floor(s.size/4)} step={.5} format={(n)=>`${n}px`}/><label class="mono guides"><input type="checkbox" bind:checked={guides}/> Include keyline guides in SVG</label><p class="mono note">Circle, square and diagonal guides are design aids. Turn them off for a clean asset.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.preview{flex:1;display:grid;place-items:center;min-height:150px;overflow:hidden}.preview img{max-width:100%;max-height:240px;width:auto;height:auto}.surface :global(.code){max-height:110px;text-align:left;overflow:auto}.guides,.note{font-size:11px;line-height:1.5;color:var(--ink-2)}.guides{display:flex;align-items:center;gap:10px}</style>
