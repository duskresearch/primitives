<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {elevation} from '@duskresearch/primitives/design/light';
  import {setQuery} from '@/lib/client/harness';
  import LightColors from '../LightColors.svelte';
  import {serializeWith,type LightState} from '../state';
  let {initial,own}:{initial:LightState;own:{levels:number;step:number;opacity:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<LightState>({...initial});
  // svelte-ignore state_referenced_locally
  let levels=$state(own.levels),step=$state(own.step),opacity=$state(own.opacity);
  const answer=$derived(elevation({...s,levels,step,opacity}));
  let loaded=false;$effect(()=>{const q=serializeWith(s,{levels,step,opacity});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><div class="ladder" style={`background:${s.background}`}>{#each answer.levels as level}<div class="level"><div class="sample" style={`${level.css}background:${s.background};color:${s.foreground}`}>{level.name}</div><Copy value={level.css} label="elevation shadow">{level.height}px</Copy></div>{/each}</div><div class="block"><p>Elevation CSS variables</p><Copy value={answer.css} label="elevation tokens" primary class="code">{answer.css}</Copy></div></div>
<div class="panel"><LightColors bind:value={s}/><Slider group="Light angle" label="Angle" bind:value={s.angle} min={0} max={360} step={1} format={(n)=>`${n}°`}/><Slider group="Softness" label="Soft" bind:value={s.softness} min={0} max={1} step={.01} format={(n)=>n.toFixed(2)}/><Slider group="Elevation levels" label="Levels" bind:value={levels} min={3} max={8} step={1} format={String}/><Slider group="Elevation step" label="Step" bind:value={step} min={1} max={3} step={1} format={(n)=>`${n}px`}/><Slider group="Opacity" label="Alpha" bind:value={opacity} min={0} max={1} step={.01} format={(n)=>n.toFixed(2)}/></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.ladder{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:20px;padding:25px;max-height:260px;overflow:auto}.level{display:flex;flex-direction:column;gap:10px;align-items:center}.sample{padding:20px 10px;border:1px solid var(--line-2);font-size:11px;text-align:center}.level :global(.copy){font:11px var(--mono)}.surface :global(.code){max-height:150px;text-align:left;overflow:auto}.panel :global(.slider){grid-template-columns:48px minmax(0,1fr) 48px}</style>
