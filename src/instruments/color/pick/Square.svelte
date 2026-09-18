<script lang="ts">
  // The picker everyone knows: saturation across, brightness up, at one hue. Drawn in Okhsv,
  // so every point is a color screens can show. Drag to choose; from the keyboard, two
  // sliders underneath move the same point (arrows, Shift for ten steps).
  import { fromHsv, hsvRgb, type Hsv } from '@duskresearch/primitives/design/color';
  import { textOn } from '../ui';

  let { hsv = $bindable() }: { hsv: Hsv } = $props();

  // Painted small and scaled up: the square is all smooth gradients, so nothing is lost, and
  // it repaints in a few milliseconds as the hue moves.
  const W = 160;
  const H = 100;
  let canvas = $state<HTMLCanvasElement>();
  let dragging = false;

  $effect(() => {
    const h = hsv.h;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const image = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) {
      const v = 1 - y / (H - 1);
      for (let x = 0; x < W; x++) {
        const rgb = hsvRgb({ h, s: x / (W - 1), v });
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
    hsv.s = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * 1000) / 1000;
    hsv.v = Math.round(Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height)) * 1000) / 1000;
  }
</script>

<div class="square">
  <canvas
    bind:this={canvas}
    width={W}
    height={H}
    aria-hidden="true"
    onpointerdown={(e) => {
      dragging = true;
      canvas!.setPointerCapture(e.pointerId);
      set(e);
    }}
    onpointermove={(e) => dragging && set(e)}
    onpointerup={() => (dragging = false)}
    onpointercancel={() => (dragging = false)}
  ></canvas>
  <span
    class="marker"
    aria-hidden="true"
    style:left={`${hsv.s * 100}%`}
    style:top={`${(1 - hsv.v) * 100}%`}
    style:border-color={textOn(fromHsv(hsv))}
  ></span>
  <input
    class="visually-hidden"
    type="range"
    min="0"
    max="100"
    step="1"
    value={Math.round(hsv.s * 100)}
    oninput={(e) => (hsv.s = Number(e.currentTarget.value) / 100)}
    aria-label="Saturation"
    aria-valuetext={`${Math.round(hsv.s * 100)}%`}
  />
  <input
    class="visually-hidden"
    type="range"
    min="0"
    max="100"
    step="1"
    value={Math.round(hsv.v * 100)}
    oninput={(e) => (hsv.v = Number(e.currentTarget.value) / 100)}
    aria-label="Brightness"
    aria-valuetext={`${Math.round(hsv.v * 100)}%`}
  />
</div>

<style>
  .square {
    position: relative;
  }
  .square:has(input:focus-visible) {
    outline: var(--focus);
    outline-offset: var(--focus-offset);
  }
  canvas {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 160 / 100;
    cursor: crosshair;
    touch-action: none;
  }
  .marker {
    position: absolute;
    width: 14px;
    height: 14px;
    margin: -7px 0 0 -7px;
    border: 2px solid;
    border-radius: 50%;
    pointer-events: none;
  }
</style>
