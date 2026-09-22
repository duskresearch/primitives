<script lang="ts">
  import NumberField from '@/components/tool/NumberField.svelte';
  import type {RandomState} from './state';
  let {value=$bindable()}:{value:RandomState}=$props();
  let error=$state('');
  function renew(){
    if(!globalThis.crypto?.getRandomValues){error='Browser entropy is unavailable.';return;}
    value.seed=crypto.getRandomValues(new Uint32Array(1))[0];error='';
  }
</script>
<div class="seed-control"><NumberField label="S" name="Reproducible seed" value={value.seed} min={0} max={4294967295} integer onchange={(v)=>value.seed=v}/><button type="button" onclick={renew}>New seed</button></div>
{#if error}<p role="alert">{error}</p>{/if}
<style>.seed-control{display:flex;gap:16px;align-items:center}.seed-control :global(.number){flex:1}.seed-control button{text-decoration:underline;text-underline-offset:3px;font-family:var(--mono);font-size:11px;white-space:nowrap}</style>
