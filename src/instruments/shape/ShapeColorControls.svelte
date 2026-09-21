<script lang="ts">
  import ColorControls from '@/instruments/color/ColorControls.svelte';
  import { hex, parseColor } from '@duskresearch/primitives/design/color';

  let { foreground = $bindable() }: { foreground: string } = $props();
  // The shared URL and operation contract use displayable sRGB hex. ColorControls
  // works in OKLCH and mutates its channels; quantize once for preview/export/URL.
  // svelte-ignore state_referenced_locally
  let color = $state(parseColor(foreground));
  let hydrated = false;
  $effect(() => {
    const next = hex(color);
    if (hydrated && next !== foreground) foreground = next;
    hydrated = true;
  });
</script>

<ColorControls name="Shape foreground" key="foreground" bind:color />
