<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {stripes} from '@duskresearch/primitives/design/pattern';
  import {setQuery} from '@/lib/client/harness';
  import PatternControls from '../PatternControls.svelte';
  import {serializeWith,type PatternState} from '../state';
  let {initial,own}:{initial:PatternState;own:{style:'stripes'|'dots'|'checks';width:number;angle:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<PatternState>({...initial});
  // svelte-ignore state_referenced_locally
  let style=$state(own.style),width=$state(own.width),angle=$state(own.angle);
  const safeWidth=$derived(Math.min(width,s.tileSize/2));
  const answer=$derived(stripes({...s,style,width:safeWidth,angle}));
  let loaded=false;$effect(()=>{if(width>s.tileSize/2)width=s.tileSize/2;const q=serializeWith(s,{style,width,angle});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><div class="preview" style={answer.css} role="img" aria-label={`${style} CSS pattern preview`}></div><div class="block"><p>Complete CSS background</p><Copy value={answer.css} label="pattern CSS" primary class="code">{answer.css}</Copy></div></div>
<div class="panel"><PatternControls bind:value={s}/><Choice label="Repeat style" options={['stripes','dots','checks'] as const} names={{stripes:'Stripes',dots:'Dots',checks:'Checks'}} bind:value={style}/><Slider group="Band or dot width" label="Width" bind:value={width} min={1} max={s.tileSize/2} step={1} format={(n)=>`${n}px`}/><Slider group="Stripe angle" label="Angle" bind:value={angle} min={0} max={360} step={1} format={(n)=>`${n}°`}/><p class="mono note">Angle changes stripes only. Dots and checks use the shared tile pitch.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.preview{flex:1;min-height:190px;border:1px solid var(--line-2)}.surface :global(.code){max-height:100px;text-align:left;overflow:auto}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}</style>
