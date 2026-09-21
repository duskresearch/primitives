<script lang="ts">
  import {hex,parseColor} from '@duskresearch/primitives/design/color';
  import type {LightState} from './state';
  let {value=$bindable()}:{value:LightState}=$props();
  let error=$state('');
  function accept(kind:'foreground'|'background',raw:string){
    try{value[kind]=hex(parseColor(raw));error='';}
    catch{error=`Enter a valid ${kind} color.`;}
  }
</script>
<div class="colors">
  <label class="mono">Foreground <input type="color" aria-label="Foreground color" value={value.foreground} oninput={(e)=>accept('foreground',e.currentTarget.value)}/><input type="text" aria-label="Foreground CSS color" value={value.foreground} onchange={(e)=>accept('foreground',e.currentTarget.value)}/></label>
  <label class="mono">Background <input type="color" aria-label="Background color" value={value.background} oninput={(e)=>accept('background',e.currentTarget.value)}/><input type="text" aria-label="Background CSS color" value={value.background} onchange={(e)=>accept('background',e.currentTarget.value)}/></label>
</div>
{#if error}<p role="alert" class="mono">{error}</p>{/if}
<style>.colors{display:flex;flex-direction:column;gap:10px}.colors label{display:grid;grid-template-columns:75px 36px minmax(0,1fr);gap:8px;align-items:center;font-size:11px;color:var(--ink-2)}input[type=color]{width:32px;height:32px;padding:0;border:1px solid var(--line-2)}input[type=text]{min-width:0;border-bottom:1px solid var(--line-3);font:11px var(--mono);padding:5px}.colors :global(input:focus-visible){outline:var(--focus);outline-offset:var(--focus-offset)}</style>
