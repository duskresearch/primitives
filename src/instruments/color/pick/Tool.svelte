<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { cssOklch, gamutOf, hex, type Lch } from '@duskresearch/primitives/design/color';
  import { serialize, type ColorState } from '../state';
  import { textOn } from '../ui';
  import ColorControls from '../ColorControls.svelte';
  import Plane from './Plane.svelte';

  let { initial }: { initial: ColorState } = $props();

  // Pick works on A; B rides along in the URL for the other Color instruments.
  // svelte-ignore state_referenced_locally
  let a = $state<Lch>({ ...initial.a });
  // svelte-ignore state_referenced_locally
  const b = initial.b;
  const CMAX = 0.37;

  const css = $derived(cssOklch(a));
  const shown = $derived(hex(a));
  const gamut = $derived(gamutOf(a));
  const where = { srgb: 'Inside sRGB', p3: 'Display P3 only', wider: 'Beyond Display P3' };

  let loaded = false;
  $effect(() => {
    const query = serialize({ a, b });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<!-- The surface paints oklch() itself, so a wide-gamut screen shows the color as chosen. -->
<div class="surface" style:background-color={css} style:color={textOn(a)}>
  <div class="labels mono">
    <Copy value={shown} label="hex">{gamut === 'srgb' ? shown : `sRGB shows ${shown}`}</Copy>
    <span>{where[gamut]}</span>
  </div>
  <Copy value={css} label="oklch" primary class="big">{css}</Copy>
</div>

<div class="panel">
  <Plane bind:color={a} cmax={CMAX} />
  <ColorControls name="Color" key="A" bind:color={a} cmax={CMAX} />
</div>

<style>
  .labels {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    font-size: 11px;
  }
  .surface :global(.big) {
    align-self: flex-start;
    font-size: 44px;
    line-height: 1.05;
    font-weight: 300;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }
  @media (max-width: 719px) {
    .surface :global(.big) {
      font-size: 28px;
      line-height: 1.1;
      font-weight: 400;
      letter-spacing: -0.02em;
    }
  }
</style>
