<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {exportPattern} from '@duskresearch/primitives/design/pattern';
  import {setQuery} from '@/lib/client/harness';
  import PatternControls from '../PatternControls.svelte';
  import {serializeWith,type PatternState} from '../state';
  let {initial,own}:{initial:PatternState;own:{size:number;rotation:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<PatternState>({...initial});
  // svelte-ignore state_referenced_locally
  let size=$state(own.size),rotation=$state(own.rotation),busy=$state(false),status=$state('');
  const answer=$derived(exportPattern({...s,size,rotation}));
  const preview=$derived(`data:image/svg+xml,${encodeURIComponent(answer.svg)}`);
  let loaded=false;$effect(()=>{const q=serializeWith(s,{size,rotation});if(loaded)setQuery(q);loaded=true;});
  async function download(kind:'svg'|'png'){
    if(busy)return;busy=true;status=`Preparing ${kind.toUpperCase()}.`;
    try{const adapter=await import('./download');if(kind==='svg')adapter.downloadSvg(answer.svg,answer.svgFilename);else await adapter.downloadPng(answer.tileSvg,answer.pngSize,answer.filename);status=`${kind.toUpperCase()} downloaded.`;}
    catch(error){status=error instanceof Error?`Could not download: ${error.message}`:'Could not download image.';}
    finally{busy=false;}
  }
</script>
<div class="surface"><div class="preview"><img src={preview} width={s.tileSize*4} height={s.tileSize*4} alt="Pattern SVG preview"/></div><div class="block"><p>Self-contained repeating SVG · C copies this</p><Copy value={answer.svg} label="pattern SVG" primary class="code">{answer.svg}</Copy></div></div>
<div class="panel"><PatternControls bind:value={s}/><Slider group="Motif size ratio" label="Size" bind:value={size} min={.1} max={.9} step={.01} format={(n)=>`${Math.round(n*100)}%`}/><Slider group="Motif rotation" label="Turn" bind:value={rotation} min={0} max={360} step={1} format={(n)=>`${n}°`}/><div class="actions"><button type="button" disabled={busy} onclick={()=>download('svg')}>Download SVG</button><button type="button" disabled={busy} onclick={()=>download('png')}>Download PNG tile</button></div><p role="status" aria-live="polite" class="mono note">{status}</p><p class="mono note">PNG is one {answer.pngSize} × {answer.pngSize} tile made locally from the same SVG geometry. No upload.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.preview{flex:1;display:grid;place-items:center;min-height:140px;overflow:hidden}.preview img{max-width:100%;max-height:260px;width:auto;height:auto}.surface :global(.code){max-height:100px;text-align:left;overflow:auto}.actions{display:flex;flex-wrap:wrap;gap:8px}.actions button{background:var(--ink);color:var(--paper);padding:10px 14px;font-size:13px}.actions button:disabled{opacity:.6}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}</style>
