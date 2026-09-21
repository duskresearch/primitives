<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {texture} from '@duskresearch/primitives/design/noise';
  import {setQuery} from '@/lib/client/harness';
  import NoiseControls from '../NoiseControls.svelte';
  import {serializeWith,type NoiseState} from '../state';
  let {initial,own}:{initial:NoiseState;own:{preset:'grain'|'paper'|'clouds';size:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<NoiseState>({...initial});
  // svelte-ignore state_referenced_locally
  let preset=$state(own.preset),size=$state(own.size),busy=$state(false),status=$state('');
  const answer=$derived(texture({...s,preset,size}));
  const preview=$derived(`data:image/svg+xml,${encodeURIComponent(answer.svg)}`);
  let loaded=false;$effect(()=>{const q=serializeWith(s,{preset,size});if(loaded)setQuery(q);loaded=true;});
  async function download(kind:'svg'|'png'){
    if(busy)return;busy=true;status=`Preparing ${kind.toUpperCase()}.`;
    try{const adapter=await import('./download');if(kind==='svg')adapter.downloadSvg(answer.svg,answer.svgFilename);else await adapter.downloadPng(answer.svg,answer.size,answer.filename);status=`${kind.toUpperCase()} downloaded.`;}
    catch(error){status=error instanceof Error?`Could not download: ${error.message}`:'Could not download image.';}
    finally{busy=false;}
  }
</script>
<div class="surface"><div class="preview"><img src={preview} width={answer.size} height={answer.size} alt={`Seeded ${preset} procedural texture`}/></div><div class="block"><p>Self-contained texture SVG · C copies this</p><Copy value={answer.svg} label="texture SVG" primary class="code">{answer.svg}</Copy></div></div>
<div class="panel"><NoiseControls bind:value={s}/><Choice label="Texture recipe" options={['grain','paper','clouds'] as const} names={{grain:'Grain',paper:'Paper',clouds:'Clouds'}} bind:value={preset}/><Slider group="Texture edge" label="Size" bind:value={size} min={64} max={1024} step={1} format={(n)=>`${n}px`}/><div class="actions"><button type="button" disabled={busy} onclick={()=>download('svg')}>Download SVG</button><button type="button" disabled={busy} onclick={()=>download('png')}>Download PNG</button></div><p role="status" aria-live="polite" class="mono note">{status}</p><p class="mono note">One local {size} × {size} image per action. SVG filter rendering and PNG antialiasing can vary by browser.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.preview{flex:1;display:grid;place-items:center;min-height:150px;overflow:hidden}.preview img{max-width:100%;max-height:250px;width:auto;height:auto}.surface :global(.code){max-height:100px;text-align:left;overflow:auto}.actions{display:flex;flex-wrap:wrap;gap:8px}.actions button{background:var(--ink);color:var(--paper);padding:10px 14px;font-size:13px}.actions button:disabled{opacity:.6}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}</style>
