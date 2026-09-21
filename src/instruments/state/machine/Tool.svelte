<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import { machine, transition } from '@duskresearch/primitives/design/state';
  import { setQuery } from '@/lib/client/harness';
  import Editor from '../Editor.svelte';
  import { serialize, type StateState } from '../state';
  let { initial }: { initial: StateState } = $props();
  // svelte-ignore state_referenced_locally
  let value = $state<StateState>({ ...initial });
  const result = $derived.by(() => {
    try { return { answer: machine(value.schema, value.current), error: '' }; }
    catch (cause) { return { answer: null, error: cause instanceof Error ? cause.message : 'Invalid machine.' }; }
  });
  function send(event: string) {
    if (!result.answer) return;
    value.current = transition(result.answer.definition, value.current, event);
  }
  let loaded = false;
  $effect(() => { const q = serialize(value); if (loaded) setQuery(q); loaded = true; });
</script>

<div class="surface">
  {#if result.answer}
    <div class="rows">
      <div class="row"><span>Current state</span><Copy value={result.answer.current} label="current state">{result.answer.current}</Copy></div>
      <div class="row"><span>States</span><span>{result.answer.definition.states.join(' · ')}</span></div>
    </div>
    <div class="events" aria-label="Available events">
      {#each result.answer.events as edge}<button type="button" onclick={() => send(edge.event)}>{edge.event} → {edge.to}</button>{/each}
      {#if result.answer.events.length === 0}<p>No outgoing events from this state.</p>{/if}
    </div>
    <div class="block"><p>Valid machine definition</p><Copy value={result.answer.json} label="machine JSON" primary class="code">{result.answer.json}</Copy></div>
  {:else}
    <p role="status" class="invalid">Fix the definition or current state to run the machine. No events or export are available while invalid.</p>
  {/if}
</div>
<div class="panel"><Editor bind:value error={result.error}/></div>

<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .events{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .events button{border:1px solid var(--ink);padding:8px 10px;font:11px var(--mono)}
  .events p,.invalid{font-size:12px;line-height:1.5;color:var(--ink-2)}
  .surface :global(.code){max-height:160px;overflow:auto;text-align:left;white-space:pre-wrap}
</style>
