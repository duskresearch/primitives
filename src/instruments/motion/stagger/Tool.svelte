<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import { stagger } from '@duskresearch/primitives/design/motion';
  import { setQuery } from '@/lib/client/harness';
  import { serializeWith,type MotionState } from '../state';
  let {initial,own}:{initial:MotionState;own:{count:number;interval:number;order:'start'|'end'|'center'}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<MotionState>({...initial});
  // svelte-ignore state_referenced_locally
  let count=$state(own.count),interval=$state(own.interval),order=$state(own.order);
  const answer=$derived(stagger({count,interval,order,duration:s.duration}));
  let playing=$state(false),run=$state(0);
  let loaded=false;
  $effect(()=>{const q=serializeWith(s,{count,interval,order});if(loaded)setQuery(q);loaded=true;playing=false;});
  function play(){playing=false;run++;requestAnimationFrame(()=>playing=true);}
</script>
<div class="surface">
  <div class="items" style={`--duration:${s.duration}ms`}>
    {#each answer.starts as start,i}
      {#key run}<div class:playing class="item" style={`--delay:${start}ms`}>Item {i+1} <Copy value={`${start}ms`} label="start delay">{start}ms</Copy></div>{/key}
    {/each}
  </div>
  <div class="actions"><button type="button" onclick={play}>Play</button><button type="button" onclick={()=>{playing=false;run++;}}>Reset</button></div>
  <div class="rows"><div class="row"><span>Total duration</span><Copy value={`${answer.total}ms`} label="total duration">{answer.total}ms</Copy></div></div>
  <div class="block"><p>Delay list in item order</p><Copy value={answer.starts.join(', ')} label="delay list" primary class="code">{answer.starts.join(', ')} ms</Copy></div>
</div>
<div class="panel">
  <Slider group="Item count" label="Items" bind:value={count} min={1} max={30} step={1} format={String}/>
  <Slider group="Stagger interval" label="Gap" bind:value={interval} min={0} max={500} step={1} format={(n)=>`${n}ms`}/>
  <Slider group="Item duration" label="Time" bind:value={s.duration} min={1} max={5000} step={1} format={(n)=>`${n}ms`}/>
  <Choice label="Entry order" options={['start','end','center'] as const} names={{start:'Start',end:'End',center:'Center'}} bind:value={order}/>
  <div class="block"><p>CSS delays</p><Copy value={answer.css} label="CSS delays" class="code">{answer.css}</Copy></div>
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .items{max-height:220px;overflow:auto;display:flex;flex-direction:column;gap:3px}
  .item{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--paper);border:1px solid var(--line-2);font-size:13px}
  .item.playing{animation:appear var(--duration) var(--delay) both}
  @keyframes appear{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .actions{display:flex;gap:16px}.actions button{text-decoration:underline;text-underline-offset:3px}
  .surface :global(.code),.panel :global(.code){max-height:90px;text-align:left;overflow:auto}
  .panel :global(.slider){grid-template-columns:48px minmax(0,1fr) 48px}
  @media(prefers-reduced-motion:reduce){.item.playing{animation:none}}
</style>
