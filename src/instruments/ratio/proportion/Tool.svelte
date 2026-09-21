<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import {proportion} from '@duskresearch/primitives/design/ratio';
  import {setQuery} from '@/lib/client/harness';
  import DimensionControls from '../DimensionControls.svelte';
  import {serializeWith,type RatioState} from '../state';
  let {initial,own}:{initial:RatioState;own:{name:'golden'|'square'|'root2'|'root3'|'threeTwo'|'fourThree';keep:'width'|'height'}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<RatioState>({...initial});
  // svelte-ignore state_referenced_locally
  let name=$state(own.name),keep=$state(own.keep);
  const result=$derived.by(()=>{try{return {answer:proportion({...s,name,keep}),error:''};}catch(error){return {answer:null,error:error instanceof Error?error.message:'Invalid dimensions.'};}});
  let loaded=false;$effect(()=>{const q=serializeWith(s,{name,keep});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  {#if result.answer}
    <div class="frame" style={`aspect-ratio:${result.answer.solved.width}/${result.answer.solved.height}`}><span>{result.answer.label}<br>{result.answer.solved.width} × {result.answer.solved.height}px</span></div>
    <div class="rows"><div class="row"><span>Exact relationship</span><Copy value={result.answer.symbol} label="symbolic ratio">{result.answer.symbol}</Copy></div><div class="row"><span>Rounded size</span><Copy value={`${result.answer.solved.width} × ${result.answer.solved.height}px`} label="proportioned dimensions">{result.answer.solved.width} × {result.answer.solved.height}px</Copy></div><div class="row"><span>Actual decimal</span><Copy value={String(result.answer.actual)} label="actual aspect">{result.answer.actual.toFixed(6)}</Copy></div></div>
    <p class="mono note">{result.answer.rounding}</p>
    <div class="block"><p>Dimensions</p><Copy value={`${result.answer.solved.width} × ${result.answer.solved.height}px`} label="proportioned dimensions" primary class="code">{result.answer.solved.width} × {result.answer.solved.height}px</Copy></div>
  {:else}<p role="alert">{result.error}</p>{/if}
</div>
<div class="panel"><p class="mono key">Source dimensions</p><DimensionControls bind:value={s}/><Choice label="Relationship" options={['golden','square','root2','root3','threeTwo','fourThree'] as const} names={{golden:'Golden',square:'Square',root2:'√2',root3:'√3',threeTwo:'3:2',fourThree:'4:3'}} bind:value={name}/><Choice label="Keep dimension" options={['width','height'] as const} names={{width:'Width',height:'Height'}} bind:value={keep}/></div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .frame{width:min(100%,280px);max-height:230px;min-height:60px;background:var(--paper);border:1px solid var(--ink);display:grid;place-items:center;text-align:center;overflow:hidden}
  .key,.note{font-size:11px;color:var(--ink-2)}
</style>
