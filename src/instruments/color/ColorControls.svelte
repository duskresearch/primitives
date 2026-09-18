<script lang="ts">
  // One color's controls: a field that takes the color in whatever form you have it, then
  // lightness, chroma and hue in OKLCH. The field answers in the format you typed (hex until
  // you type something else), so it speaks your language while the sliders keep steps even.
  import Slider from '@/components/tool/Slider.svelte';
  import { formatAs, formatOf, parseColor, type CssFormat, type Lch } from '@duskresearch/primitives/design/color';

  let { name, key, color = $bindable(), cmax = 0.33, format = $bindable('hex') }: {
    name: string;
    /** A or B: which of the Color primitive's two colors this is. */
    key: string;
    color: Lch;
    /** The chroma slider's end. 0.33 covers sRGB. */
    cmax?: number;
    /** The format the field writes the color in; follows what was last typed. */
    format?: CssFormat;
  } = $props();

  let editing = $state(false);
  let draft = $state('');
  let invalid = $state(false);
  const shown = $derived(editing ? draft : formatAs(color, format));
  const id = `color-${key.toLowerCase()}`;

  function oninput(e: Event & { currentTarget: HTMLInputElement }) {
    draft = e.currentTarget.value;
    try {
      const c = parseColor(draft);
      color.l = c.l;
      color.c = c.c;
      color.h = c.h;
      format = formatOf(draft);
      invalid = false;
    } catch {
      invalid = draft.trim() !== '';
    }
  }

  function onfocus(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    const field = e.currentTarget;
    draft = formatAs(color, format);
    editing = true;
    invalid = false;
    requestAnimationFrame(() => field.select());
  }

  function onkeydown(e: KeyboardEvent & { currentTarget: HTMLInputElement }) {
    if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur();
  }

  const L = (v: number) => v.toFixed(2);
  const C = (v: number) => v.toFixed(3);
  const H = (v: number) => `${Math.round(v)}°`;
</script>

<div class="side" role="group" aria-label={`${name} color`}>
  <div class="side-head mono">
    <label for={id}>{name} · {key}</label>
    <input
      {id}
      class="field"
      class:invalid
      type="text"
      value={shown}
      {oninput}
      {onfocus}
      onblur={() => ((editing = false), (invalid = false))}
      {onkeydown}
      title="Hex, rgb(), hsl(), oklch() or a color name"
      aria-invalid={invalid}
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      data-autosize
    />
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
    gap: 16px;
    font-size: 11px;
    color: var(--ink-2);
  }
  .side-head .field {
    field-sizing: content;
    min-width: 8ch;
    max-width: 70%;
    padding: 5px 0;
    line-height: 1.25;
    border-bottom-color: var(--line-3);
    font-family: var(--mono);
    font-size: 11px;
    text-align: right;
    color: var(--ink);
  }
  .side-head .field:focus {
    border-bottom-color: var(--ink);
  }
  .side-head .field.invalid {
    border-bottom-color: var(--fail);
  }
  /* Natural height on touch too (about 25px, past WCAG's 24px target), so the underline stays
     under the value; the label beside it also focuses the field. */
  @media (pointer: coarse) {
    .side-head .field {
      min-height: 0;
    }
  }
</style>
