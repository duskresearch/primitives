<script lang="ts">
  import Choice from '@/components/tool/Choice.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import type {SpaceState} from './state';
  let {value=$bindable()}:{value:SpaceState}=$props();
</script>
<Choice label="Scale mode" options={['linear','modular'] as const} names={{linear:'Linear',modular:'Modular'}} bind:value={value.mode}/>
<Slider group="Base spacing" label="Base" bind:value={value.base} min={1} max={64} step={1} format={(n)=>`${n}px`}/>
{#if value.mode==='modular'}<Slider group="Modular ratio" label="Ratio" bind:value={value.ratio} min={1.05} max={2} step={.01} format={(n)=>n.toFixed(2)}/>{/if}
<Slider group="Number of steps" label="Steps" bind:value={value.steps} min={3} max={12} step={1} format={String}/>
<Slider group="Root font size" label="Root" bind:value={value.root} min={8} max={32} step={1} format={(n)=>`${n}px`}/>
<style>
  :global(.panel .slider){grid-template-columns:48px minmax(0,1fr) 48px}
</style>
