<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {seed} from '@duskresearch/primitives/design/random';
  import {setQuery} from '@/lib/client/harness';
  import SeedControl from '../SeedControl.svelte';
  import {serializeWith,type RandomState} from '../state';
  let {initial,own}:{initial:RandomState;own:{count:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<RandomState>({...initial});
  // svelte-ignore state_referenced_locally
  let count=$state(own.count);
  const answer=$derived(seed({seed:s.seed,count}));
  let loaded=false;$effect(()=>{const q=serializeWith(s,{count});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  <div class="rows">{#each answer.values as value,i}<div class="row"><span>{String(i+1).padStart(2,'0')}</span><Copy value={String(value)} label="sequence value">{value}</Copy></div>{/each}</div>
  <div class="block"><p>Reproducible uint32 sequence</p><Copy value={answer.values.join(', ')} label="seeded sequence" primary class="code">{answer.values.join(', ')}</Copy></div>
</div>
<div class="panel"><SeedControl bind:value={s}/><Slider group="Sequence length" label="Count" bind:value={count} min={1} max={100} step={1} format={String}/><div class="rows"><div class="row"><span>Seed</span><Copy value={String(s.seed)} label="seed">{s.seed}</Copy></div><div class="row"><span>Generator</span><span>Mulberry32</span></div></div><p class="mono note">Repeatable, not cryptographically secure. New seed uses browser entropy only when pressed.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.surface .rows{max-height:280px;overflow:auto}.surface :global(.code){max-height:90px;overflow:auto;text-align:left}.panel :global(.slider){grid-template-columns:48px minmax(0,1fr) 48px}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}</style>
