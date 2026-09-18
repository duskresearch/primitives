<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { cssOklch, fitSrgb, formatAs, type CssFormat, type Lch } from '@duskresearch/primitives/design/color';
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
  let format = $state<CssFormat>('hex');
  const CMAX = 0.33;

  // Pick keeps to colors every screen can show: past the edge of sRGB, chroma stops at the edge.
  $effect(() => {
    const fitted = fitSrgb(a);
    if (fitted.c < a.c) a.c = fitted.c;
  });

  const value = $derived(formatAs(a, format));
  const oklch = $derived(cssOklch(a));

  let loaded = false;
  $effect(() => {
    const query = serialize({ a, b });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface" style:background-color={oklch} style:color={textOn(a)}>
  <div class="labels mono">
    <Copy value={oklch} label="oklch">{oklch}</Copy>
  </div>
  <Copy {value} label={format} primary class="big">{value}</Copy>
</div>

<div class="panel">
  <Plane bind:color={a} cmax={CMAX} />
  <ColorControls name="Color" key="A" bind:color={a} bind:format cmax={CMAX} />
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
