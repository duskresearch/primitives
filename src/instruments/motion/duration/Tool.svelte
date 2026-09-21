<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import { duration, ease, spring } from '@duskresearch/primitives/design/motion';
  import { setQuery } from '@/lib/client/harness';
  import CurvePreview from '../CurvePreview.svelte';
  import { curve,serializeWith,type MotionState } from '../state';
  let {initial,own}:{initial:MotionState;own:{distance:number;size:'small'|'medium'|'large'}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<MotionState>({...initial});
  // svelte-ignore state_referenced_locally
  let distance=$state(own.distance),size=$state(own.size);
  const answer=$derived(duration({distance,size}));
  const chosen=$derived(s.kind==='bezier'?ease({curve:curve(s),duration:s.duration}):spring({curve:curve(s)}));
  const samples=$derived(s.kind==='bezier'?(chosen as ReturnType<typeof ease>).samples:(chosen as ReturnType<typeof spring>).points);
  let loaded=false;
  $effect(()=>{const q=serializeWith(s,{distance,size});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  <CurvePreview {samples} timing={chosen.css} duration={answer.ms} {distance}/>
  <div class="block"><p>Recommended duration</p><Copy value={answer.css} label="duration" primary class="code">{answer.css}</Copy></div>
</div>
<div class="panel">
  <Slider group="Travel distance" label="Travel" bind:value={distance} min={0} max={2000} step={1} format={(n)=>`${n}px`}/>
  <Choice label="Element size" options={['small','medium','large'] as const} names={{small:'Small',medium:'Medium',large:'Large'}} bind:value={size}/>
  <p class="mono note">Design heuristic: {answer.method}. It is not a platform standard. The shared {s.kind==='bezier'?'Bézier':'spring'} curve drives playback.</p>
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .note{font-size:11px;line-height:1.5;color:var(--ink-2)}
  .panel :global(.slider){grid-template-columns:48px minmax(0,1fr) 48px}
</style>
