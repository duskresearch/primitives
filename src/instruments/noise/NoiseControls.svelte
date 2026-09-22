<script lang="ts">
  import Slider from '@/components/tool/Slider.svelte';
  import NumberField from '@/components/tool/NumberField.svelte';
  import {hex,parseColor} from '@duskresearch/primitives/design/color';
  import type {NoiseState} from './state';
  let {value=$bindable()}:{value:NoiseState}=$props();
  let error=$state('');
  function accept(key:'foreground'|'background',raw:string){try{value[key]=hex(parseColor(raw));error='';}catch{error=`Enter a valid ${key} color.`;}}
  function renew(){if(!globalThis.crypto?.getRandomValues){error='Browser entropy is unavailable.';return;}value.seed=crypto.getRandomValues(new Uint32Array(1))[0];error='';}
</script>
<div class="seed-control"><NumberField label="S" name="Noise seed" value={value.seed} min={0} max={4294967295} integer onchange={(v)=>value.seed=v}/><button type="button" onclick={renew}>New seed</button></div>
<Slider group="Noise intensity" label="Amount" bind:value={value.intensity} min={0} max={1} step={.01} format={(n)=>n.toFixed(2)}/>
<div class="colors"><label class="mono">Foreground <input type="color" aria-label="Noise foreground" value={value.foreground} oninput={(e)=>accept('foreground',e.currentTarget.value)}/><input type="text" aria-label="Noise foreground CSS color" value={value.foreground} onchange={(e)=>accept('foreground',e.currentTarget.value)}/></label><label class="mono">Background <input type="color" aria-label="Noise background" value={value.background} oninput={(e)=>accept('background',e.currentTarget.value)}/><input type="text" aria-label="Noise background CSS color" value={value.background} onchange={(e)=>accept('background',e.currentTarget.value)}/></label></div>
{#if error}<p role="alert">{error}</p>{/if}
<style>.seed-control{display:flex;gap:12px;align-items:center}.seed-control :global(.number){flex:1}.seed-control button{text-decoration:underline;text-underline-offset:3px;font:11px var(--mono);white-space:nowrap}.colors{display:flex;flex-direction:column;gap:10px}.colors label{display:grid;grid-template-columns:75px 36px minmax(0,1fr);gap:8px;align-items:center;font-size:11px;color:var(--ink-2)}input[type=color]{width:32px;height:32px;padding:0;border:1px solid var(--line-2)}input[type=text]{min-width:0;border-bottom:1px solid var(--line-3);font:11px var(--mono);padding:5px}.colors :global(input:focus-visible){outline:var(--focus);outline-offset:var(--focus-offset)}:global(.panel .slider){grid-template-columns:48px minmax(0,1fr) 48px}</style>
