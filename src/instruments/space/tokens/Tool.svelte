<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import {tokens} from '@duskresearch/primitives/design/space';
  import {setQuery} from '@/lib/client/harness';
  import SpaceControls from '../SpaceControls.svelte';
  import {serializeWith,type SpaceState} from '../state';
  let {initial,own}:{initial:SpaceState;own:{format:'css'|'json'|'tailwind3'}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<SpaceState>({...initial});
  // svelte-ignore state_referenced_locally
  let format=$state(own.format);
  const answer=$derived(tokens({...s,format}));
  let loaded=false;$effect(()=>{const q=serializeWith(s,{format});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  <div class="block"><p>{format==='tailwind3'?'Tailwind CSS v3 configuration':format.toUpperCase()}</p><Copy value={answer.code} label="spacing tokens" primary class="code">{answer.code}</Copy></div>
  <p class="mono note">{answer.values.length} values, identical to Scale’s rounded pixel ramp.</p>
</div>
<div class="panel"><Choice label="Token format" options={['css','json','tailwind3'] as const} names={{css:'CSS',json:'JSON',tailwind3:'Tailwind CSS v3'}} bind:value={format}/><SpaceControls bind:value={s}/></div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .surface :global(.code){width:100%;max-height:280px;text-align:left;overflow:auto}
  .note{font-size:11px;color:var(--ink-2)}
</style>
