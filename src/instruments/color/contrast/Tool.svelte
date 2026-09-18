<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { fixText, grade, hex, ratio, ratioText, type Lch } from '@duskresearch/primitives/color';
  import { serialize, type ColorState } from '../state';

  let { initial }: { initial: ColorState } = $props();

  // svelte-ignore state_referenced_locally
  let a = $state<Lch>({ ...initial.a });
  // svelte-ignore state_referenced_locally
  let b = $state<Lch>({ ...initial.b });

  const aHex = $derived(hex(a));
  const bHex = $derived(hex(b));
  const r = $derived(ratio(a, b));
  const shown = $derived(ratioText(r));
  const passes = $derived(r >= 4.5);
  const fix = $derived(fixText(a, b));

  // Write to the URL on change, not on load.
  let loaded = false;
  $effect(() => {
    const query = serialize({ a, b });
    if (loaded) setQuery(query);
    loaded = true;
  });

  const L = (v: number) => v.toFixed(2);
  const C = (v: number) => v.toFixed(3);
  const H = (v: number) => `${Math.round(v)}°`;
</script>

<div class="surface" style:background-color={bHex} style:color={aHex}>
  <div class="labels mono">
    <Copy value={aHex} label="hex">text {aHex}</Copy>
    <Copy value={bHex} label="hex">background {bHex}</Copy>
  </div>
  <div class="sample">
    <p class="large">
      <span class="wide">Large text at 44 px, weight 300, reads like this.</span>
      <span class="narrow">Large text at 34 px, weight 300, reads like this.</span>
    </p>
    <p class="body">
      Body text at 16 px. Long enough to judge properly: if this paragraph is tiring to read here, it will be tiring on your page
      too.
    </p>
  </div>
  <div class="result">
    <Copy value={`${shown}:1`} label="ratio" primary>
      <span class="ratio">{shown}<span class="unit">: 1</span></span>
    </Copy>
    <span class="grade mono">{grade(r)}</span>
  </div>
</div>

<div class="panel">
  {#snippet side(name: string, key: string, color: Lch, value: string)}
    <div class="side" role="group" aria-label={`${name} color`}>
      <div class="side-head mono">
        <span>{name} · {key}</span>
        <Copy {value} label="hex" class="ink">{value}</Copy>
      </div>
      <Slider group={name} label="L" bind:value={color.l} min={0} max={1} step={0.005} format={L} />
      <Slider group={name} label="C" bind:value={color.c} min={0} max={0.33} step={0.001} format={C} />
      <Slider group={name} label="H" bind:value={color.h} min={0} max={360} step={1} format={H} />
    </div>
  {/snippet}
  {@render side('Text', 'A', a, aHex)}
  {@render side('Background', 'B', b, bHex)}

  <div class="checks mono">
    <div class="check">
      <span>Body text · 4.5</span>
      <span class:fail={!passes}>{passes ? 'Passes' : 'Fails'}</span>
      <span class="muted">AA</span>
    </div>
    {#if fix}
      <button type="button" class="fix" onclick={() => (a.l = fix.color.l)}>
        <span class="swatch" style:background-color={fix.hex}></span>
        <span>{fix.direction === 'darken' ? 'Darken' : 'Lighten'} text to {fix.hex} → {ratioText(fix.ratio)} : 1</span>
        <span class="apply">Apply</span>
      </button>
    {/if}
  </div>
</div>

<style>
  .labels,
  .result {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
  }
  .labels {
    font-size: 12px;
  }
  .sample {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .large {
    font-size: 44px;
    line-height: 1.05;
    font-weight: 300;
    letter-spacing: -0.03em;
    text-wrap: pretty;
  }
  .body {
    max-width: 520px;
    font-size: 16px;
    line-height: 1.45;
  }
  .ratio {
    font-size: 64px;
    line-height: 1;
    font-weight: 300;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
  }
  .unit {
    margin-left: 6px;
    font-size: 24px;
    letter-spacing: 0;
  }
  .grade {
    font-size: 13px;
  }
  .narrow {
    display: none;
  }

  .side {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .side-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--ink-2);
  }
  .side-head :global(.ink) {
    color: var(--ink);
  }
  .checks {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 12px;
  }
  .check {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 12px;
    padding: 8px 0;
    border-top: 1px solid var(--line-2);
    color: var(--ink-1);
  }
  .fail {
    color: var(--fail);
  }
  .fix {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 10px 0 0;
    border: 0;
    border-top: 1px solid var(--line-2);
    background: transparent;
    font: inherit;
    text-align: left;
    color: var(--ink);
  }
  .swatch {
    width: 14px;
    height: 14px;
  }
  .apply {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: 719px) {
    .large {
      font-size: 34px;
    }
    .wide {
      display: none;
    }
    .narrow {
      display: inline;
    }
    .ratio {
      font-size: 44px;
      line-height: 1.05;
      letter-spacing: -0.03em;
    }
    .unit {
      font-size: 19px;
    }
  }
  @media (pointer: coarse) {
    .fix {
      min-height: var(--min-hit);
    }
  }
</style>
