<script lang="ts">
  import NumberField from '@/components/tool/NumberField.svelte';
  import type {RatioState} from './state';
  let {value=$bindable()}:{value:RatioState}=$props();
</script>
<div class="dimensions"><NumberField label="W" name="Source width in pixels" value={value.width} min={1} max={16384} integer onchange={(v)=>value.width=v}/><NumberField label="H" name="Source height in pixels" value={value.height} min={1} max={16384} integer onchange={(v)=>value.height=v}/></div>
<style>.dimensions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}</style>
