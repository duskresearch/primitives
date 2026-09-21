<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import { exportMachine, machine } from '@duskresearch/primitives/design/state';
  import { setQuery } from '@/lib/client/harness';
  import Editor from '../Editor.svelte';
  import { serializeWith, type StateState } from '../state';
  let { initial, own }: { initial: StateState; own: { target: 'xstate' | 'js' } } = $props();
  // svelte-ignore state_referenced_locally
  let value = $state<StateState>({ ...initial });
  // svelte-ignore state_referenced_locally
  let target = $state<'xstate' | 'js'>(own.target);
  const result = $derived.by(() => {
    try {
      machine(value.schema, value.current);
      return { answer: exportMachine(value.schema), error: '' };
    } catch (cause) { return { answer: null, error: cause instanceof Error ? cause.message : 'Invalid machine.' }; }
  });
  let loaded = false;
  $effect(() => { const q = serializeWith(value, { target }); if (loaded) setQuery(q); loaded = true; });
</script>

<div class="surface">
  {#if result.answer}
    <div class="rows"><div class="row"><span>Format</span><span>{target === 'xstate' ? 'XState v5 configuration JSON' : 'Plain JavaScript function'}</span></div></div>
    <div class="block"><p>{target === 'xstate' ? 'Static machine configuration' : 'Pure transition function'}</p><Copy value={target === 'xstate' ? result.answer.config : result.answer.js} label="machine export" primary class="code">{target === 'xstate' ? result.answer.config : result.answer.js}</Copy></div>
    <p class="mono note">{target === 'xstate' ? 'This is configuration, not a live machine. Pass it to an XState v5 runtime to execute it.' : 'This standalone function takes a state and event and returns the next state. Unhandled events leave state unchanged.'}</p>
  {:else}
    <p role="status" class="invalid">Fix the definition or current state before exporting. Invalid drafts produce no code.</p>
  {/if}
</div>
<div class="panel">
  <div class="target" role="group" aria-label="Export target"><button type="button" aria-pressed={target === 'xstate'} onclick={() => target = 'xstate'}>XState v5 JSON</button><button type="button" aria-pressed={target === 'js'} onclick={() => target = 'js'}>Plain JS</button></div>
  <Editor bind:value error={result.error}/>
</div>

<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .surface :global(.code){max-height:300px;overflow:auto;text-align:left;white-space:pre-wrap}
  .note,.invalid{font-size:11px;line-height:1.5;color:var(--ink-2)}
  .target{display:flex;gap:8px}.target button{border:1px solid var(--line-2);padding:8px 10px;font:11px var(--mono)}
  .target button[aria-pressed="true"]{border-color:var(--ink);background:var(--ink);color:var(--paper)}
</style>
