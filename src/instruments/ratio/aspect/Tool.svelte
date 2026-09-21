<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import NumberField from '@/components/tool/NumberField.svelte';
  import {aspect} from '@duskresearch/primitives/design/ratio';
  import {setQuery} from '@/lib/client/harness';
  import DimensionControls from '../DimensionControls.svelte';
  import {serializeWith,type RatioState} from '../state';
  let {initial,own}:{initial:RatioState;own:{targetWidth:number;targetHeight:number;keep:'width'|'height'}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<RatioState>({...initial});
  // svelte-ignore state_referenced_locally
  let targetWidth=$state(own.targetWidth),targetHeight=$state(own.targetHeight),keep=$state(own.keep);
  const result=$derived.by(()=>{try{return {answer:aspect({...s,targetWidth,targetHeight,keep}),error:''};}catch(error){return {answer:null,error:error instanceof Error?error.message:'Invalid dimensions.'};}});
  let loaded=false;$effect(()=>{const q=serializeWith(s,{targetWidth,targetHeight,keep});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  {#if result.answer}
    <div class="frame" style={`aspect-ratio:${result.answer.target.width}/${result.answer.target.height}`}><span>Target frame<br>{result.answer.solved.width} × {result.answer.solved.height}px</span></div>
    <div class="rows"><div class="row"><span>Current ratio</span><Copy value={`${result.answer.current.width}:${result.answer.current.height}`} label="current ratio">{result.answer.current.width}:{result.answer.current.height}</Copy></div><div class="row"><span>Exact value</span><Copy value={String(result.answer.value)} label="aspect value">{result.answer.value.toFixed(6)}</Copy></div><div class="row"><span>Solved size</span><Copy value={`${result.answer.solved.width} × ${result.answer.solved.height}px`} label="solved dimensions">{result.answer.solved.width} × {result.answer.solved.height}px</Copy></div></div>
    <p class="mono note">{result.answer.rounding}</p>
    <div class="block"><p>Target aspect-ratio CSS</p><Copy value={result.answer.css} label="aspect-ratio CSS" primary class="code">{result.answer.css}</Copy></div>
  {:else}<p role="alert">{result.error}</p>{/if}
</div>
<div class="panel">
  <p class="mono key">Source dimensions</p><DimensionControls bind:value={s}/>
  <p class="mono key">Desired ratio</p><div class="dimensions"><NumberField label="W" name="Target ratio width" value={targetWidth} min={1} max={1000} onchange={(v)=>targetWidth=v}/><NumberField label="H" name="Target ratio height" value={targetHeight} min={1} max={1000} onchange={(v)=>targetHeight=v}/></div>
  <Choice label="Keep dimension" options={['width','height'] as const} names={{width:'Width',height:'Height'}} bind:value={keep}/>
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .frame{width:min(100%,280px);max-height:230px;min-height:60px;background:var(--paper);border:1px solid var(--ink);display:grid;place-items:center;text-align:center;overflow:hidden}
  .dimensions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.key,.note{font-size:11px;color:var(--ink-2)}
</style>
