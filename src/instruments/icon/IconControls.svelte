<script lang="ts">
  import Choice from '@/components/tool/Choice.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {hex,parseColor} from '@duskresearch/primitives/design/color';
  import type {IconState} from './state';
  let {value=$bindable()}:{value:IconState}=$props();
  let error=$state('');
  function accept(raw:string){try{value.foreground=hex(parseColor(raw));error='';}catch{error='Enter a valid foreground color.';}}
</script>
<Choice label="Built-in exemplar" options={['square','circle','triangle'] as const} names={{square:'Square',circle:'Circle',triangle:'Triangle'}} bind:value={value.exemplar}/>
<label class="mono size-label">Canvas size <select aria-label="Icon canvas size" value={value.size} onchange={(e)=>value.size=Number(e.currentTarget.value) as IconState['size']}>{#each [16,20,24,32,48] as size}<option value={size}>{size}px</option>{/each}</select></label>
<Slider group="Icon stroke width" label="Stroke" bind:value={value.stroke} min={.5} max={4} step={.5} format={(n)=>`${n}px`}/>
<label class="mono color-label">Foreground <input type="color" aria-label="Icon foreground" value={value.foreground} oninput={(e)=>accept(e.currentTarget.value)}/><input type="text" aria-label="Icon foreground CSS color" value={value.foreground} onchange={(e)=>accept(e.currentTarget.value)}/></label>
{#if error}<p role="alert">{error}</p>{/if}
<style>.size-label{display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--ink-2)}select{padding:5px;background:var(--paper);border:1px solid var(--line-2);font:11px var(--mono)}.color-label{display:grid;grid-template-columns:75px 36px minmax(0,1fr);gap:8px;align-items:center;font-size:11px;color:var(--ink-2)}input[type=color]{width:32px;height:32px;padding:0;border:1px solid var(--line-2)}input[type=text]{min-width:0;border-bottom:1px solid var(--line-3);font:11px var(--mono);padding:5px}:global(.panel .slider){grid-template-columns:48px minmax(0,1fr) 48px}</style>
