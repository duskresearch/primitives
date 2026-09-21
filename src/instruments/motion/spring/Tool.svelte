<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { spring } from '@duskresearch/primitives/design/motion';
  import { setQuery } from '@/lib/client/harness';
  import CurvePreview from '../CurvePreview.svelte';
  import { curve, serializeWith, type MotionState } from '../state';
  let {initial}:{initial:MotionState}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<MotionState>({...initial});
  const answer=$derived(spring({curve:curve(s)}));
  let loaded=false;
  $effect(()=>{const q=serializeWith(s);if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  <CurvePreview samples={answer.points} timing={answer.css} duration={answer.duration}/>
  <div class="rows">
    <div class="row"><span>Settling tolerance</span><Copy value="position 0.001; speed 0.001/s" label="spring tolerance">±0.001 position · ±0.001/s</Copy></div>
    <div class="row"><span>Settling</span><Copy value={`${answer.duration}ms`} label="spring settling">{answer.settled?`${answer.duration}ms`:'Not settled by 10s'}</Copy></div>
    <div class="row"><span>Approximation</span><Copy value={`${answer.maxError}`} label="approximation error">{answer.maxError.toFixed(4)}{answer.capped?' · target unmet':''}</Copy></div>
  </div>
  <div class="block"><p>CSS linear() approximation</p><Copy value={answer.css} label="CSS spring" primary class="code">{answer.css}</Copy></div>
</div>
<div class="panel">
  <Slider group="Spring mass" label="Mass" bind:value={s.mass} min={.01} max={10} step={.01} format={(n)=>n.toFixed(2)}/>
  <Slider group="Spring stiffness" label="Stiff" bind:value={s.stiffness} min={1} max={1000} step={1} format={String}/>
  <Slider group="Spring damping" label="Damp" bind:value={s.damping} min={.01} max={100} step={.01} format={(n)=>n.toFixed(2)}/>
  <Slider group="Initial velocity" label="Speed" bind:value={s.velocity} min={-100} max={100} step={.1} format={(n)=>n.toFixed(1)}/>
  <p class="mono note">Max 256 stops. Midpoint error target 0.002; an explicit warning appears if the cap is reached.</p>
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .surface :global(.code){max-height:90px;text-align:left;overflow:auto}
  .note{font-size:11px;line-height:1.5;color:var(--ink-2)}
  .panel :global(.slider){grid-template-columns:48px minmax(0,1fr) 48px}
</style>
