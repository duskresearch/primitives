<script lang="ts">
  import { example } from '@duskresearch/primitives/design/state';
  import { defaultSchema, type StateState } from './state';
  let { value = $bindable(), error = '' }: { value: StateState; error?: string } = $props();
  function reset() { value.schema = defaultSchema; value.current = example.initial; }
</script>

<div class="editor">
  <label for="state-schema" class="mono">Machine definition (JSON, 6000 characters maximum)</label>
  <textarea id="state-schema" bind:value={value.schema} maxlength="6001" rows="14" spellcheck="false" aria-invalid={error ? 'true' : undefined}></textarea>
  <div class="editor-foot"><span class="mono">{value.schema.length}/6000</span><button type="button" onclick={reset}>Reset example</button></div>
  {#if error}<p role="alert" class="error">{error}</p>{/if}
  <p class="mono note">Flat deterministic states only. Edit states, initial and from/event/to transitions; no guards, actions or nested states.</p>
</div>

<style>
  .editor{display:flex;flex-direction:column;gap:8px;min-width:0}
  label,.editor-foot,.note{font-size:11px;line-height:1.5;color:var(--ink-2)}
  textarea{width:100%;min-height:230px;resize:vertical;border:1px solid var(--line-2);padding:10px;background:var(--paper-2);color:var(--ink);font:11px/1.55 var(--mono)}
  .editor-foot{display:flex;justify-content:space-between;align-items:center}
  button{text-decoration:underline;text-underline-offset:3px;font:11px var(--mono)}
  .error{color:#a63325;font-size:12px;line-height:1.4}
  textarea:focus-visible,button:focus-visible{outline:var(--focus);outline-offset:var(--focus-offset)}
</style>
