<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import NumberField from '@/components/tool/NumberField.svelte';
  import {dice} from '@duskresearch/primitives/design/random';
  import {setQuery} from '@/lib/client/harness';
  import SeedControl from '../SeedControl.svelte';
  import {serializeWith,type RandomState} from '../state';
  let {initial,own}:{initial:RandomState;own:{count:number;sides:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<RandomState>({...initial});
  // svelte-ignore state_referenced_locally
  let count=$state(own.count),sides=$state(own.sides);
  const answer=$derived(dice({seed:s.seed,count,sides}));
  let loaded=false;$effect(()=>{const q=serializeWith(s,{count,sides});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><Copy value={String(answer.total)} label="dice total" primary class="large">{answer.total}</Copy><div class="rolls">{#each answer.rolls as roll,i}<Copy value={String(roll)} label={`die ${i+1}`}>{roll}</Copy>{/each}</div><div class="rows"><div class="row"><span>Roll list</span><Copy value={answer.rolls.join(', ')} label="dice rolls">{answer.rolls.join(', ')}</Copy></div><div class="row"><span>Possible total</span><Copy value={`${answer.minimum}–${answer.maximum}`} label="dice total bounds">{answer.minimum}–{answer.maximum}</Copy></div></div></div>
<div class="panel"><div class="fields"><NumberField label="N" name="Number of dice" value={count} min={1} max={100} integer onchange={(v)=>count=v}/><NumberField label="D" name="Sides per die" value={sides} min={2} max={1000} integer onchange={(v)=>sides=v}/></div><SeedControl bind:value={s}/><p class="mono note">Every die uses the same unbiased inclusive integer mapper. This is a reproducible simulation, not secure randomness.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.surface :global(.large){font-size:clamp(44px,7vw,72px);font-weight:300}.rolls{display:flex;flex-wrap:wrap;gap:6px;max-height:160px;overflow:auto}.rolls :global(.copy){display:grid;place-items:center;min-width:32px;height:32px;border:1px solid var(--ink);font-family:var(--mono);font-size:11px}.fields{display:flex;flex-direction:column;gap:10px}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}</style>
