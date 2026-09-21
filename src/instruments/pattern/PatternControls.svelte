<script lang="ts">
  import Choice from '@/components/tool/Choice.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {hex,parseColor} from '@duskresearch/primitives/design/color';
  import type {PatternState} from './state';
  let {value=$bindable()}:{value:PatternState}=$props();
  let error=$state('');
  function accept(key:'foreground'|'background',raw:string){try{value[key]=hex(parseColor(raw));error='';}catch{error=`Enter a valid ${key} color.`;}}
</script>
<Choice label="Motif" options={['circle','square','triangle'] as const} names={{circle:'Circle',square:'Square',triangle:'Triangle'}} bind:value={value.motif}/>
<Slider group="Tile pitch" label="Tile" bind:value={value.tileSize} min={8} max={256} step={1} format={(n)=>`${n}px`}/>
<div class="colors"><label class="mono">Foreground <input type="color" aria-label="Pattern foreground" value={value.foreground} oninput={(e)=>accept('foreground',e.currentTarget.value)}/><input type="text" aria-label="Pattern foreground CSS color" value={value.foreground} onchange={(e)=>accept('foreground',e.currentTarget.value)}/></label><label class="mono">Background <input type="color" aria-label="Pattern background" value={value.background} oninput={(e)=>accept('background',e.currentTarget.value)}/><input type="text" aria-label="Pattern background CSS color" value={value.background} onchange={(e)=>accept('background',e.currentTarget.value)}/></label></div>
{#if error}<p role="alert">{error}</p>{/if}
<style>.colors{display:flex;flex-direction:column;gap:10px}.colors label{display:grid;grid-template-columns:75px 36px minmax(0,1fr);gap:8px;align-items:center;font-size:11px;color:var(--ink-2)}input[type=color]{width:32px;height:32px;padding:0;border:1px solid var(--line-2)}input[type=text]{min-width:0;border-bottom:1px solid var(--line-3);font:11px var(--mono);padding:5px}.colors :global(input:focus-visible){outline:var(--focus);outline-offset:var(--focus-offset)}:global(.panel .slider){grid-template-columns:48px minmax(0,1fr) 48px}</style>
