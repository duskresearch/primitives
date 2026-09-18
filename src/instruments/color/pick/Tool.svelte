<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import FormatSelect from '@/components/tool/FormatSelect.svelte';
  import NumberField from '@/components/tool/NumberField.svelte';
  import { setQuery } from '@/lib/client/harness';
  import {
    channelsOf, cssOklch, formatAs, formatOf, fromChannels, fromHsv, hex, parseColor, toHsv,
    type ChannelFormat, type CssFormat, type Hsv, type Lch,
  } from '@duskresearch/primitives/design/color';
  import { serialize, type ColorState } from '../state';
  import { textOn } from '../ui';
  import Square from './Square.svelte';

  let { initial }: { initial: ColorState } = $props();

  // Pick works on A; B rides along in the URL for the other Color instruments. The picker
  // holds its place in Okhsv, so the hue stays put when the color turns gray.
  // svelte-ignore state_referenced_locally
  let hsv = $state<Hsv>(toHsv(initial.a));
  // svelte-ignore state_referenced_locally
  const b = initial.b;
  const a = $derived(fromHsv(hsv));
  let format = $state<CssFormat>('hex');
  const setColor = (c: Lch) => (hsv = toHsv(c, hsv.h));

  // The hue strip: the full circle at full strength.
  const hues = `linear-gradient(to right, ${Array.from({ length: 13 }, (_, i) => hex(fromHsv({ h: i * 30, s: 1, v: 1 }))).join(', ')})`;

  // One box per channel: letter, name, range, decimal places.
  const channels: Record<ChannelFormat, [string, string, number, number, number][]> = {
    rgb: [['R', 'Red', 0, 255, 0], ['G', 'Green', 0, 255, 0], ['B', 'Blue', 0, 255, 0]],
    hsl: [['H', 'Hue', 0, 360, 1], ['S', 'Saturation', 0, 100, 1], ['L', 'Lightness', 0, 100, 1]],
    oklch: [['L', 'Lightness', 0, 1, 3], ['C', 'Chroma', 0, 0.37, 3], ['H', 'Hue', 0, 360, 1]],
  };
  const values = $derived(format === 'hex' ? null : channelsOf(a, format));

  function setChannel(i: number, n: number) {
    const f = format as ChannelFormat;
    const next = [...channelsOf(a, f)] as [number, number, number];
    next[i] = n;
    setColor(fromChannels(f, next));
  }

  // The hex box takes a color in any form; typing rgb() or hsl() there switches to that
  // format once you leave the box, so it never vanishes mid-word.
  let editing = $state(false);
  let draft = $state('');
  let invalid = $state(false);
  let typed: CssFormat = 'hex';
  const hexShown = $derived(editing ? draft : hex(a));

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
    {#if format === 'oklch'}
      <Copy value={hex(a)} label="hex">{hex(a)}</Copy>
    {:else}
      <Copy value={oklch} label="oklch">{oklch}</Copy>
    {/if}
  </div>
  <Copy {value} label={format} primary class="big">{value}</Copy>
</div>

<div class="panel">
  <Square bind:hsv />
  <input
    class="hue"
    type="range"
    min="0"
    max="360"
    step="1"
    value={Math.round(hsv.h)}
    oninput={(e) => (hsv.h = Number(e.currentTarget.value))}
    aria-label="Hue"
    aria-valuetext={`${Math.round(hsv.h)}°`}
    style:--hues={hues}
  />
  <div class="entry">
    <FormatSelect bind:format label="Color format" />
    {#if values}
      <div class="channels">
        {#each channels[format as ChannelFormat] as [label, name, min, max, places], i (label + name)}
          <NumberField {label} {name} value={values[i]} {min} {max} {places} onchange={(n) => setChannel(i, n)} />
        {/each}
      </div>
    {:else}
      <input
        class="field hex"
        class:invalid
        type="text"
        value={hexShown}
        aria-label="Color"
        aria-invalid={invalid}
        title="Hex, rgb(), hsl(), oklch() or a color name"
        oninput={(e) => {
          draft = e.currentTarget.value;
          try {
            setColor(parseColor(draft));
            typed = formatOf(draft);
            invalid = false;
          } catch {
            invalid = draft.trim() !== '';
          }
        }}
        onfocus={(e) => {
          const field = e.currentTarget;
          draft = hex(a);
          typed = 'hex';
          editing = true;
          requestAnimationFrame(() => field.select());
        }}
        onblur={() => {
          editing = false;
          invalid = false;
          format = typed;
        }}
        onkeydown={(e) => (e.key === 'Enter' || e.key === 'Escape') && e.currentTarget.blur()}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
    {/if}
  </div>
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

  /* The hue strip: the circle of hues as the track, a ring for the thumb. */
  .hue {
    appearance: none;
    width: 100%;
    height: 14px;
    margin: 0;
    background: var(--hues);
    cursor: pointer;
  }
  .hue::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 20px;
    border: 2px solid var(--ink);
    border-radius: 2px;
    background: transparent;
    box-shadow: 0 0 0 1px var(--paper);
  }
  .hue::-moz-range-thumb {
    width: 10px;
    height: 16px;
    border: 2px solid var(--ink);
    border-radius: 2px;
    background: transparent;
    box-shadow: 0 0 0 1px var(--paper);
  }

  .entry {
    display: flex;
    align-items: baseline;
    gap: 16px;
  }
  .channels {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .hex {
    flex: 1;
    min-width: 0;
    padding: 5px 0;
    line-height: 1.25;
    border-bottom-color: var(--line-3);
    font-family: var(--mono);
    font-size: 11px;
    text-align: right;
    color: var(--ink);
  }
  .hex:focus {
    border-bottom-color: var(--ink);
  }
  .hex.invalid {
    border-bottom-color: var(--fail);
  }

  @media (pointer: coarse) {
    .hue {
      height: var(--min-hit);
      background: var(--hues) no-repeat center / 100% 14px;
    }
    .hex {
      min-height: 0;
    }
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
