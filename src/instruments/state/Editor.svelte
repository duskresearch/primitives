<script lang="ts">
  import { example, parseDefinition } from '@duskresearch/primitives/design/state';
  import { defaultSchema, type StateState } from './state';
  let { value = $bindable(), error = '' }: { value: StateState; error?: string } = $props();
  const definition = $derived.by(() => {
    try { return parseDefinition(value.schema); } catch { return null; }
  });
  function reset() { value.schema = defaultSchema; value.current = example.initial; }
</script>

<div class="editor">
  <label for="state-schema" class="mono">Machine definition (JSON, 6000 characters maximum)</label>
  <textarea id="state-schema" bind:value={value.schema} maxlength="6001" rows="14" spellcheck="false" aria-invalid={error ? 'true' : undefined}></textarea>
  <div class="editor-foot"><span class="mono">{value.schema.length}/6000</span><button type="button" onclick={reset}>Reset example</button></div>
  {#if definition}
    <label for="state-current" class="mono">Current state</label>
    <select id="state-current" bind:value={value.current} aria-invalid={!definition.states.includes(value.current) ? 'true' : undefined}>
      {#each definition.states as state}<option value={state}>{state}</option>{/each}
    </select>
    {#if !definition.states.includes(value.current)}
      <button type="button" class="recover" onclick={() => value.current = definition.initial}>Set current to {definition.initial}</button>
    {/if}
  {/if}
  {#if error}<p role="alert" class="error">{error}</p>{/if}
  <p class="mono note">Flat deterministic states only. Edit states, initial and from/event/to transitions; no guards, actions or nested states.</p>
</div>

<style>
  .editor{display:flex;flex-direction:column;gap:8px;min-width:0}
  label,.editor-foot,.note{font-size:11px;line-height:1.5;color:var(--ink-2)}
  textarea{width:100%;min-height:230px;resize:vertical;border:1px solid var(--line-2);padding:10px;background:var(--paper-2);color:var(--ink);font:11px/1.55 var(--mono)}
  select{width:100%;border:1px solid var(--line-2);padding:8px;background:var(--paper-2);color:var(--ink);font:11px var(--mono)}
  .editor-foot{display:flex;justify-content:space-between;align-items:center}
  button{text-decoration:underline;text-underline-offset:3px;font:11px var(--mono)}
  .recover{align-self:flex-start}
  .error{color:#a63325;font-size:12px;line-height:1.4}
  textarea:focus-visible,select:focus-visible,button:focus-visible{outline:var(--focus);outline-offset:var(--focus-offset)}
</style>
