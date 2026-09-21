<script lang="ts">
  import Choice from '@/components/tool/Choice.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import type { MotionState } from './state';
  let { value = $bindable(), duration = true }: { value: MotionState; duration?: boolean } = $props();
</script>

<Choice label="Curve model" options={['bezier','spring'] as const} names={{bezier:'Cubic Bézier',spring:'Spring'}} bind:value={value.kind}/>
{#if value.kind === 'bezier'}
  <div class="controls">
    <Slider group="First control x" label="X1" bind:value={value.x1} min={0} max={1} step={.01} format={(n)=>n.toFixed(2)}/>
    <Slider group="First control y" label="Y1" bind:value={value.y1} min={-2} max={3} step={.01} format={(n)=>n.toFixed(2)}/>
    <Slider group="Second control x" label="X2" bind:value={value.x2} min={0} max={1} step={.01} format={(n)=>n.toFixed(2)}/>
    <Slider group="Second control y" label="Y2" bind:value={value.y2} min={-2} max={3} step={.01} format={(n)=>n.toFixed(2)}/>
  </div>
{:else}
  <div class="controls">
    <Slider group="Spring mass" label="Mass" bind:value={value.mass} min={.01} max={10} step={.01} format={(n)=>n.toFixed(2)}/>
    <Slider group="Spring stiffness" label="Stiff" bind:value={value.stiffness} min={1} max={1000} step={1} format={String}/>
    <Slider group="Spring damping" label="Damp" bind:value={value.damping} min={.01} max={100} step={.01} format={(n)=>n.toFixed(2)}/>
    <Slider group="Initial velocity" label="Speed" bind:value={value.velocity} min={-100} max={100} step={.1} format={(n)=>n.toFixed(1)}/>
  </div>
{/if}
{#if duration}<Slider group="Duration" label="Time" bind:value={value.duration} min={1} max={5000} step={1} format={(n)=>`${n}ms`}/>{/if}

<style>
  .controls{display:flex;flex-direction:column;gap:10px}
  .controls :global(.slider){grid-template-columns:38px minmax(0,1fr) 48px}
</style>
