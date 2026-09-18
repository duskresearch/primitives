<script lang="ts">
  // Lightness against chroma at the current hue. Painted where sRGB can show the color and
  // left clear beyond it, so the edge of what screens show is the picture. Drag to set
  // lightness and chroma; the sliders below do the same from the keyboard.
  import { inSrgb, type Lch } from '@duskresearch/primitives/design/color';
  import { textOn } from '../ui';

  let { color = $bindable(), cmax }: { color: Lch; cmax: number } = $props();

  // Drawn small and scaled up: the edge is a curve, so smoothing does it no harm.
  const W = 240;
  const H = 120;
  let canvas = $state<HTMLCanvasElement>();
  let dragging = false;

  $effect(() => {
    const h = color.h;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const image = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) {
      const l = 1 - (y + 0.5) / H;
      for (let x = 0; x < W; x++) {
        const rgb = inSrgb({ l, c: ((x + 0.5) / W) * cmax, h });
        if (!rgb) continue;
        const i = (y * W + x) * 4;
        image.data[i] = rgb.r * 255;
        image.data[i + 1] = rgb.g * 255;
        image.data[i + 2] = rgb.b * 255;
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  });

  function set(e: PointerEvent) {
    const r = canvas!.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    color.c = Math.round(x * cmax * 1000) / 1000;
    color.l = Math.round((1 - y) * 200) / 200;
  }

  function down(e: PointerEvent) {
    dragging = true;
    canvas!.setPointerCapture(e.pointerId);
    set(e);
  }
</script>

<div class="plane">
  <div class="head mono" aria-hidden="true">
    <span>L × C at {Math.round(color.h)}°</span>
    <span>Clear: beyond sRGB</span>
  </div>
  <div class="field">
    <canvas
      bind:this={canvas}
      width={W}
      height={H}
      aria-hidden="true"
      onpointerdown={down}
      onpointermove={(e) => dragging && set(e)}
      onpointerup={() => (dragging = false)}
      onpointercancel={() => (dragging = false)}
    ></canvas>
    <span
      class="marker"
      aria-hidden="true"
      style:left={`${Math.min(1, color.c / cmax) * 100}%`}
      style:top={`${(1 - color.l) * 100}%`}
      style:border-color={textOn(color)}
    ></span>
  </div>
</div>

<style>
  .plane {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 11px;
    color: var(--ink-2);
  }
  .field {
    position: relative;
    border: 1px solid var(--line-2);
  }
  canvas {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 240 / 120;
    cursor: crosshair;
    touch-action: none;
  }
  .marker {
    position: absolute;
    width: 12px;
    height: 12px;
    margin: -6px 0 0 -6px;
    border: 2px solid;
    border-radius: 50%;
    pointer-events: none;
  }
</style>
