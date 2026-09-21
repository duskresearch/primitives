<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {shadow} from '@duskresearch/primitives/design/light';
  import {setQuery} from '@/lib/client/harness';
  import LightColors from '../LightColors.svelte';
  import {serializeWith,type LightState} from '../state';
  let {initial,own}:{initial:LightState;own:{elevation:number;opacity:number;layers:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<LightState>({...initial});
  // svelte-ignore state_referenced_locally
  let elevation=$state(own.elevation),opacity=$state(own.opacity),layers=$state(own.layers);
  const answer=$derived(shadow({...s,elevation,opacity,layers}));
  let loaded=false;$effect(()=>{const q=serializeWith(s,{elevation,opacity,layers});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><div class="shadow-scene" style={`background:${s.background}`}><div class="shadow-card" style={`${answer.css}background:${s.background};color:${s.foreground}`}>Shadow sample</div><div class="light-direction mono" style={`transform:rotate(${s.angle}deg)`}>↑</div></div><div class="block"><p>Box shadow CSS</p><Copy value={answer.css} label="box-shadow CSS" primary class="code">{answer.css}</Copy></div><p class="mono note">{answer.model}</p></div>
<div class="panel"><LightColors bind:value={s}/><Slider group="Light angle" label="Angle" bind:value={s.angle} min={0} max={360} step={1} format={(n)=>`${n}°`}/><Slider group="Softness" label="Soft" bind:value={s.softness} min={0} max={1} step={.01} format={(n)=>n.toFixed(2)}/><Slider group="Elevation" label="Lift" bind:value={elevation} min={0} max={24} step={1} format={(n)=>`${n}px`}/><Slider group="Opacity" label="Alpha" bind:value={opacity} min={0} max={1} step={.01} format={(n)=>n.toFixed(2)}/><Slider group="Shadow layers" label="Layers" bind:value={layers} min={1} max={5} step={1} format={String}/></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.shadow-scene{min-height:210px;display:grid;place-items:center;position:relative;overflow:hidden}.shadow-card{padding:30px;border:1px solid var(--line-2);font-size:20px}.light-direction{position:absolute;top:12px;left:12px;font-size:24px}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}.surface :global(.code){max-height:100px;overflow:auto;text-align:left}.panel :global(.slider){grid-template-columns:48px minmax(0,1fr) 48px}</style>
