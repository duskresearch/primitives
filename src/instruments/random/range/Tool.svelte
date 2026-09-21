<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import NumberField from '@/components/tool/NumberField.svelte';
  import {range} from '@duskresearch/primitives/design/random';
  import {setQuery} from '@/lib/client/harness';
  import SeedControl from '../SeedControl.svelte';
  import {serializeWith,type RandomState} from '../state';
  let {initial,own}:{initial:RandomState;own:{lower:number;upper:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<RandomState>({...initial});
  // svelte-ignore state_referenced_locally
  let lower=$state(own.lower),upper=$state(own.upper);
  const result=$derived.by(()=>{try{return {answer:range({seed:s.seed,lower,upper}),error:''};}catch(error){return {answer:null,error:error instanceof Error?error.message:'Invalid range.'};}});
  let loaded=false;$effect(()=>{const q=serializeWith(s,{lower,upper});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  {#if result.answer}<Copy value={String(result.answer.value)} label="random number" primary class="large">{result.answer.value}</Copy><p class="mono note">Inclusive range · {lower} to {upper}</p>{:else}<p role="alert">{result.error}</p>{/if}
</div>
<div class="panel"><div class="bounds"><NumberField label="Lo" name="Inclusive lower bound" value={lower} min={-1000000000} max={1000000000} onchange={(v)=>lower=v}/><NumberField label="Hi" name="Inclusive upper bound" value={upper} min={-1000000000} max={1000000000} onchange={(v)=>upper=v}/></div><SeedControl bind:value={s}/><p class="mono note">Mulberry32 with rejection sampling avoids modulo bias. Seeded results are repeatable, not cryptographically secure.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:center}.surface :global(.large){font-size:clamp(36px,7vw,72px);font-weight:300;text-align:center;overflow-wrap:anywhere}.bounds{display:flex;flex-direction:column;gap:10px}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}</style>
