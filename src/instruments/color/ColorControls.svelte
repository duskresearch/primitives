<script lang="ts">
  // One color's sliders, as Contrast lays them out: a head with its name and hex, then
  // lightness, chroma and hue in OKLCH.
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { hex, type Lch } from '@duskresearch/primitives/design/color';

  let { name, key, color = $bindable(), cmax = 0.33 }: {
    name: string;
    /** A or B: which of the Color primitive's two colors this is. */
    key: string;
    color: Lch;
    /** The chroma slider's end. 0.33 covers sRGB; 0.37 reaches into Display P3. */
    cmax?: number;
  } = $props();

  const value = $derived(hex(color));
  const L = (v: number) => v.toFixed(2);
  const C = (v: number) => v.toFixed(3);
  const H = (v: number) => `${Math.round(v)}°`;
</script>

<div class="side" role="group" aria-label={`${name} color`}>
  <div class="side-head mono">
    <span>{name} · {key}</span>
    <Copy {value} label="hex" class="ink">{value}</Copy>
  </div>
  <Slider group={name} label="L" bind:value={color.l} min={0} max={1} step={0.005} format={L} />
  <Slider group={name} label="C" bind:value={color.c} min={0} max={cmax} step={0.001} format={C} />
  <Slider group={name} label="H" bind:value={color.h} min={0} max={360} step={1} format={H} />
</div>

<style>
  .side {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .side-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: var(--ink-2);
  }
  .side-head :global(.ink) {
    color: var(--ink);
  }
</style>
