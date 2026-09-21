<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {stroke} from '@duskresearch/primitives/design/icon';
  import {setQuery} from '@/lib/client/harness';
  import IconControls from '../IconControls.svelte';
  import {serializeWith,type IconState} from '../state';
  let {initial,own}:{initial:IconState;own:{padding:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<IconState>({...initial});
  // svelte-ignore state_referenced_locally
  let padding=$state(own.padding);
  const answer=$derived(stroke({...s,padding}));
  const scaled=$derived(`data:image/svg+xml,${encodeURIComponent(answer.scaledSvg)}`);
  const fixed=$derived(`data:image/svg+xml,${encodeURIComponent(answer.fixedSvg)}`);
  let loaded=false;$effect(()=>{const q=serializeWith(s,{padding});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><div class="comparison"><div><p class="mono">Scaling stroke</p>{#each answer.comparisons as item}<span class="icon-cell"><img src={scaled} width={item.size} height={item.size} alt={`Scaling stroke at ${item.size}px`}/><Copy value={`${item.size}px`} label="icon size">{item.size}px</Copy></span>{/each}</div><div><p class="mono">Non-scaling stroke</p>{#each answer.comparisons as item}<span class="icon-cell"><img src={fixed} width={item.size} height={item.size} alt={`Fixed stroke at ${item.size}px`}/><Copy value={`${item.size}px`} label="icon size">{item.size}px</Copy></span>{/each}</div></div><div class="block"><p>Non-scaling SVG</p><Copy value={answer.fixedSvg} label="non-scaling icon SVG" primary class="code">{answer.fixedSvg}</Copy></div></div>
<div class="panel"><IconControls bind:value={s}/><Slider group="Icon padding" label="Pad" bind:value={padding} min={0} max={6} step={.5} format={(n)=>`${n}px`}/><div class="block"><p>Scaling SVG</p><Copy value={answer.scaledSvg} label="scaling icon SVG" class="code">{answer.scaledSvg}</Copy></div><div class="block"><p>Example CSS size</p><Copy value={answer.css} label="icon size CSS" class="code">{answer.css}</Copy></div><p class="mono note">Both examples use one 24 × 24 viewBox. vector-effect keeps the second stroke in CSS pixels.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.comparison{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.comparison>div{display:flex;flex-direction:column;gap:10px}.comparison p,.note{font-size:11px;line-height:1.5;color:var(--ink-2)}.icon-cell{display:flex;gap:8px;align-items:center;min-height:52px}.icon-cell :global(.copy){font:11px var(--mono)}.surface :global(.code),.panel :global(.code){max-height:90px;text-align:left;overflow:auto}</style>
