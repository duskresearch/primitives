<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { ease, spring } from '@duskresearch/primitives/design/motion';
  import { setQuery } from '@/lib/client/harness';
  import CurveControls from '../CurveControls.svelte';
  import CurvePreview from '../CurvePreview.svelte';
  import { curve, serializeWith, type MotionState } from '../state';
  let { initial, own }: { initial:MotionState; own:{distance:number} }=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<MotionState>({...initial});
  // svelte-ignore state_referenced_locally
  let distance=$state(own.distance);
  const answer=$derived(s.kind==='bezier'?ease({curve:curve(s),duration:s.duration}):spring({curve:curve(s)}));
  const timing=$derived(answer.css);
  const ms=$derived(s.kind==='bezier'?s.duration:(answer as ReturnType<typeof spring>).duration);
  let loaded=false;
  $effect(()=>{const q=serializeWith(s,{distance});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  <CurvePreview samples={s.kind==='bezier'?(answer as ReturnType<typeof ease>).samples:(answer as ReturnType<typeof spring>).points} {timing} duration={ms} {distance}/>
  <div class="block"><p>{s.kind==='bezier'?'CSS cubic Bézier':'CSS sampled spring'}</p>{#if s.kind==='bezier' || (answer as ReturnType<typeof spring>).settled}<Copy value={timing} label="CSS timing" primary class="code">{timing}</Copy>{:else}<p role="status">Not settled by 10s. Preview is truncated; no complete CSS timing is available.</p>{/if}</div>
</div>
<div class="panel">
  <CurveControls bind:value={s}/>
  <Slider group="Comparison distance" label="Travel" bind:value={distance} min={0} max={1000} step={1} format={(n)=>`${n}px`}/>
  {#if s.kind==='spring'}<p class="mono note">{#if (answer as ReturnType<typeof spring>).settled}Spring playback uses its measured settling time, <Copy value={`${ms}ms`} label="settling time">{ms}ms</Copy>.{:else}Spring playback stops at the 10s sampling limit before settling.{/if} The shared Bézier duration remains saved for Export.</p>{/if}
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .surface :global(.code){max-height:90px;text-align:left;overflow:auto}
  .panel :global(.slider){grid-template-columns:48px minmax(0,1fr) 48px}
  .note{font-size:11px;line-height:1.5;color:var(--ink-2)}
</style>
