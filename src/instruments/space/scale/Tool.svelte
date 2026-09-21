<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import {scale} from '@duskresearch/primitives/design/space';
  import {setQuery} from '@/lib/client/harness';
  import SpaceControls from '../SpaceControls.svelte';
  import {serializeWith,type SpaceState} from '../state';
  let {initial}:{initial:SpaceState}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<SpaceState>({...initial});
  const answer=$derived(scale(s));
  let loaded=false;$effect(()=>{const q=serializeWith(s);if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  <div class="ramp">
    {#each answer.values as item}
      <div class="measure"><span class="mono">{item.name}</span><div class="bar" style={`width:${item.pixels}px`}></div><Copy value={`${item.pixels}px`} label="spacing">{item.pixels}px</Copy><Copy value={`${item.rem}rem`} label="spacing rem">{item.rem}rem</Copy></div>
    {/each}
  </div>
  <p class="mono note">{answer.rounding}</p>
  <div class="block"><p>CSS custom properties</p><Copy value={answer.css} label="spacing CSS" primary class="code">{answer.css}</Copy></div>
</div>
<div class="panel"><SpaceControls bind:value={s}/><p class="mono note">Linear uses whole base multiples. Modular multiplies each preceding step by the ratio. The root size is used only for the rem readout.</p></div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .ramp{max-height:280px;overflow:auto;display:flex;flex-direction:column;gap:8px}
  .measure{display:grid;grid-template-columns:62px minmax(0,1fr) 50px 58px;gap:8px;align-items:center;font-size:11px;min-width:0}
  .bar{height:14px;max-width:100%;background:var(--ink)}
  .measure :global(.copy){font-family:var(--mono);font-size:11px;white-space:nowrap}
  .note{font-size:11px;line-height:1.5;color:var(--ink-2)}
  .surface :global(.code){max-height:110px;text-align:left;overflow:auto}
</style>
