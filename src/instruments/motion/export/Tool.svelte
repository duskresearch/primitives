<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import { exportMotion } from '@duskresearch/primitives/design/motion';
  import { setQuery } from '@/lib/client/harness';
  import CurveControls from '../CurveControls.svelte';
  import { curve,serializeWith,type MotionState } from '../state';
  let {initial,own}:{initial:MotionState;own:{target:'css'|'motion'|'swiftui'}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<MotionState>({...initial});
  // svelte-ignore state_referenced_locally
  let target=$state(own.target);
  const answer=$derived(exportMotion({curve:curve(s),duration:s.duration,target}));
  let loaded=false;
  $effect(()=>{const q=serializeWith(s,{target});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  <div class="block"><p>{target==='css'?'CSS':target==='motion'?'Motion for React':'SwiftUI'} · {s.kind}</p><Copy value={answer.code} label="motion export" primary class="code">{answer.code}</Copy></div>
  <p class="mono note">{answer.note}</p>
</div>
<div class="panel">
  <Choice label="Export target" options={['css','motion','swiftui'] as const} names={{css:'CSS',motion:'Motion',swiftui:'SwiftUI'}} bind:value={target}/>
  <CurveControls bind:value={s}/>
  <p class="mono note">CSS spring output uses sampled linear() stops. Motion preserves physics parameters. SwiftUI has no exact parameter mapping here.</p>
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .surface :global(.code){width:100%;max-height:240px;text-align:left;overflow:auto}
  .note{font-size:11px;line-height:1.5;color:var(--ink-2)}
</style>
