<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {optical} from '@duskresearch/primitives/design/icon';
  import {setQuery} from '@/lib/client/harness';
  import IconControls from '../IconControls.svelte';
  import {serializeWith,type IconState} from '../state';
  let {initial,own}:{initial:IconState;own:{padding:number;scale:number;offsetX:number;offsetY:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<IconState>({...initial});
  // svelte-ignore state_referenced_locally
  let padding=$state(own.padding),scale=$state(own.scale),offsetX=$state(own.offsetX),offsetY=$state(own.offsetY);
  const safePadding=$derived(Math.min(padding,Math.floor(s.size/4)));
  const answer=$derived(optical({...s,padding:safePadding,scale,offsetX,offsetY}));
  const preview=$derived(`data:image/svg+xml,${encodeURIComponent(answer.overlaySvg)}`);
  let loaded=false;$effect(()=>{if(padding>Math.floor(s.size/4))padding=Math.floor(s.size/4);const q=serializeWith(s,{padding,scale,offsetX,offsetY});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><div class="preview"><img src={preview} width={s.size*8} height={s.size*8} alt="Nominal icon in gray and adjusted icon in ink"/></div><div class="rows"><div class="row"><span>Applied scale</span><Copy value={String(answer.appliedScale)} label="applied optical scale">{answer.appliedScale}{answer.clamped?' · clamped to fit':''}</Copy></div><div class="row"><span>Transform</span><Copy value={answer.transform} label="optical transform">{answer.transform}</Copy></div></div><div class="block"><p>Adjusted clean SVG</p><Copy value={answer.svg} label="optically adjusted SVG" primary class="code">{answer.svg}</Copy></div></div>
<div class="panel"><IconControls bind:value={s}/><Slider group="Icon padding" label="Pad" bind:value={padding} min={0} max={Math.floor(s.size/4)} step={.5} format={(n)=>`${n}px`}/><Slider group="Manual optical scale" label="Scale" bind:value={scale} min={.8} max={1.2} step={.01} format={(n)=>n.toFixed(2)}/><Slider group="Horizontal offset" label="X" bind:value={offsetX} min={-3} max={3} step={.1} format={(n)=>`${n}px`}/><Slider group="Vertical offset" label="Y" bind:value={offsetY} min={-3} max={3} step={.1} format={(n)=>`${n}px`}/><p class="mono note">Corrections are manual and limited to the built-in exemplar. The darker shape is adjusted; the faint one is nominal.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.preview{flex:1;display:grid;place-items:center;min-height:150px;overflow:hidden}.preview img{max-width:100%;max-height:240px;width:auto;height:auto}.surface :global(.code){max-height:110px;text-align:left;overflow:auto}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}</style>
