<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { FORMS, favicon } from '@duskresearch/primitives/design/shape';
  import { hex, serializeWith, type ShapeState } from '../state';
  let { initial, own }: { initial: ShapeState; own: {foreground:string;background:string;padding:number;inner:number} } = $props();
  // svelte-ignore state_referenced_locally
  let shared=$state({...initial});
  // svelte-ignore state_referenced_locally
  let s=$state({...own});
  let foregroundDraft=$state(own.foreground),backgroundDraft=$state(own.background);
  let busy=$state(false),status=$state('');
  const answer=$derived(favicon({...shared,...s}));
  const preview=$derived(`data:image/svg+xml,${encodeURIComponent(answer.svg)}`);
  let loaded=false;
  $effect(()=>{const query=serializeWith(shared,s);if(loaded)setQuery(query);loaded=true});
  async function download(){
    if(busy)return;busy=true;status='Preparing icon files.';
    try{const {downloadIconSet}=await import('./download');await downloadIconSet(answer);status='ZIP downloaded.';}
    catch(error){status=error instanceof Error?`Could not make ZIP: ${error.message}`:'Could not make ZIP.';}
    finally{busy=false;}
  }
</script>
<div class="surface">
  <div class="icon-preview"><img src={preview} width="128" height="128" alt="Generated form mark at enlarged size"/><div><img src={preview} width="48" height="48" alt="48 pixel icon"/><img src={preview} width="32" height="32" alt="32 pixel icon"/><img src={preview} width="16" height="16" alt="16 pixel icon"/></div></div>
  <p class="note">Actual-size 48, 32 and 16 px examples</p>
  <div class="block"><p>HTML integration · C copies this</p><Copy value={answer.html} label="integration HTML" primary class="code">{answer.html}</Copy></div>
</div>
<div class="panel">
  <Choice label="Form" options={FORMS} names={{circle:'Circle',square:'Square',triangle:'Triangle',ngon:'Polygon',star:'Star'}} bind:value={shared.form}/>
  <Slider group="Shared circumradius" label="Radius" bind:value={shared.radius} min={1} max={50} step={1} format={String}/>
  <Slider group="Shared rotation" label="Turn" bind:value={shared.rotation} min={0} max={359} step={1} format={(n)=>`${n}°`}/>
  {#if shared.form==='ngon'||shared.form==='star'}<Slider group="Sides" label="Sides" bind:value={shared.sides} min={3} max={12} step={1} format={String}/>{/if}
  {#if shared.form==='star'}<Slider group="Star inner radius ratio" label="Inner" bind:value={s.inner} min={0.1} max={0.9} step={0.01} format={(n)=>n.toFixed(2)}/>{/if}
  <Slider group="Padding in viewBox units" label="Pad" bind:value={s.padding} min={0} max={30} step={1} format={String}/>
  <div class="colors"><label>Foreground <input aria-label="Foreground six-digit hex color" value={foregroundDraft} aria-invalid={hex(foregroundDraft,'')===''} oninput={(e)=>{foregroundDraft=e.currentTarget.value;const value=hex(foregroundDraft,'');if(value)s.foreground=value}}/></label><label>Background <input aria-label="Background six-digit hex color" value={backgroundDraft} aria-invalid={hex(backgroundDraft,'')===''} oninput={(e)=>{backgroundDraft=e.currentTarget.value;const value=hex(backgroundDraft,'');if(value)s.background=value}}/></label></div>
  <button type="button" class="download" disabled={busy} onclick={download}>{busy?'Preparing ZIP…':'Download ZIP'}</button>
  <p role="status" aria-live="polite" class="note">{status}</p>
  <div class="block"><p>Included files</p><ul>{#each answer.files as file}<li>{file}</li>{/each}</ul></div>
  <p class="note">C copies the HTML integration markup. Download ZIP makes the files locally; no uploads. These sizes cover common browser, Apple touch and manifest uses, not every platform.</p>
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);gap:14px}.icon-preview{flex:1;display:grid;align-content:center;justify-items:center;gap:16px;min-height:160px}.icon-preview>div{display:flex;align-items:end;gap:14px}.icon-preview img{image-rendering:auto}.note{font:11px/1.5 var(--mono);color:var(--ink-2)}.surface :global(.code){max-height:88px;text-align:left;overflow:auto}.colors{display:flex;flex-wrap:wrap;gap:12px}.colors label{font:11px var(--mono);color:var(--ink-2)}.colors input{display:block;min-width:0;width:110px;border-bottom:1px solid var(--line-3);background:none;color:var(--ink);font:11px var(--mono);padding:5px}.colors input[aria-invalid="true"]{border-color:var(--fail)}.download{background:var(--ink);color:var(--paper);border:0;padding:14px 18px;align-self:flex-start;cursor:pointer}.download:disabled{opacity:.6}.panel ul{padding-left:18px;margin:0;font:11px/1.7 var(--mono)}.panel :global(.slider){grid-template-columns:48px minmax(0,1fr) 43px}
</style>
