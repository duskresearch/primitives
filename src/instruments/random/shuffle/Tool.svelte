<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import {shuffle} from '@duskresearch/primitives/design/random';
  import {setQuery} from '@/lib/client/harness';
  import SeedControl from '../SeedControl.svelte';
  import {serializeWith,type RandomState} from '../state';
  let {initial,own}:{initial:RandomState;own:{text:string}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<RandomState>({...initial});
  // svelte-ignore state_referenced_locally
  let input=$state(own.text);
  const result=$derived.by(()=>{try{return {answer:shuffle({seed:s.seed,text:input}),error:''};}catch(error){return {answer:null,error:error instanceof Error?error.message:'Invalid list.'};}});
  let loaded=false;$effect(()=>{const q=serializeWith(s,{text:input});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">{#if result.answer}<div class="rows">{#each result.answer.items as item,i}<div class="row"><span>{i+1}</span><Copy value={item} label="shuffled item">{item}</Copy></div>{/each}</div><div class="block"><p>Shuffled list · {result.answer.count} lines</p><Copy value={result.answer.text} label="shuffled list" primary class="code">{result.answer.text}</Copy></div>{:else}<p role="alert">{result.error}</p>{/if}</div>
<div class="panel"><label class="mono input-label" for="random-list">One item per line</label><textarea id="random-list" maxlength="4096" bind:value={input} spellcheck="false"></textarea><SeedControl bind:value={s}/><p class="mono note">Blank lines are ignored; duplicates and nonblank line text are preserved. Up to 100 nonblank lines and 4096 characters. The list is included in shared URLs.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.surface .rows{max-height:240px;overflow:auto}.surface :global(.code){max-height:150px;text-align:left;overflow:auto}.input-label,.note{font-size:11px;line-height:1.5;color:var(--ink-2)}textarea{width:100%;height:150px;padding:10px;border:1px solid var(--line-2);background:var(--paper);font:13px/1.4 var(--mono);resize:vertical}</style>
