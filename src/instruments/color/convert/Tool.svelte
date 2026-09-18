<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import FormatSelect from '@/components/tool/FormatSelect.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { cssOklch, formatAs, formatOf, formats, gamutOf, hex, parseColor, type CssFormat, type Lch } from '@duskresearch/primitives/design/color';
  import { serialize, type ColorState } from '../state';
  import { textOn } from '../ui';

  let { initial }: { initial: ColorState } = $props();

  // svelte-ignore state_referenced_locally
  let a = $state<Lch>({ ...initial.a });
  // svelte-ignore state_referenced_locally
  const b = initial.b;
  // svelte-ignore state_referenced_locally
  let text = $state(hex(initial.a));
  let invalid = $state(false);
  // The large value is the color "as" a format you choose. Until you choose, it offers the
  // likely other side of the conversion: oklch() for a hex or rgb(), hex for anything else.
  let target = $state<CssFormat>('oklch');
  let chosen = false;

  function oninput(e: Event) {
    text = (e.currentTarget as HTMLInputElement).value;
    try {
      a = parseColor(text);
      invalid = false;
      if (!chosen) target = ['hex', 'rgb'].includes(formatOf(text)) ? 'oklch' : 'hex';
    } catch {
      invalid = text.trim() !== '';
    }
  }

  const f = $derived(formats(a));
  const gamut = $derived(gamutOf(a));
  const primary = $derived(formatAs(a, target));
  const rows = $derived([
    ['Hex', f.hex],
    ['RGB', f.rgb],
    ['HSL', f.hsl],
    ['OKLCH', f.oklch],
    ['OKLab', f.oklab],
    ['Display P3', f.p3],
  ]);
  const where = { srgb: 'Inside sRGB', p3: 'Display P3 only', wider: 'Beyond Display P3' };

  let loaded = false;
  $effect(() => {
    const query = serialize({ a, b });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface" style:background-color={cssOklch(a)} style:color={textOn(a)}>
  <div class="paste">
    <label class="visually-hidden" for="convert-input">Color to convert</label>
    <input
      id="convert-input"
      type="text"
      value={text}
      {oninput}
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
    />
    <p class="mono hint">
      {invalid ? 'Not a color yet. Try #c53637, rgb(197 54 55), oklch(0.55 0.18 25) or tomato.' : 'Hex, rgb(), hsl(), oklch(), color(display-p3 …) or a name'}
    </p>
  </div>
  <div class="result">
    <span class="mono label" onchange={() => (chosen = true)}>as <FormatSelect bind:format={target} label="Convert to" /></span>
    <Copy value={primary} label={target} primary class="big">{primary}</Copy>
  </div>
</div>

<div class="panel">
  <div class="rows first">
    {#each rows as [name, value] (name)}
      <div class="row"><span>{name}</span><Copy {value} label={name.toLowerCase()}>{value}</Copy></div>
    {/each}
    <div class="row">
      <span>Name</span>
      <Copy value={f.named.name} label="name">{f.named.exact ? f.named.name : `${f.named.name}, nearest`}</Copy>
    </div>
  </div>
  <div class="rows">
    <div class="row"><span>Gamut</span><span>{where[gamut]}</span></div>
    {#if gamut !== 'srgb'}
      <div class="row"><span>Note</span><span>Hex, RGB and HSL are the nearest color sRGB can show.</span></div>
    {/if}
  </div>
</div>

<style>
  .paste {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  input {
    width: 100%;
    min-width: 0;
    padding: 4px 0 8px;
    border: 0;
    border-bottom: 1px solid currentColor;
    border-radius: 0;
    background: transparent;
    font: inherit;
    font-size: 28px;
    line-height: 1.1;
    font-weight: 400;
    letter-spacing: -0.02em;
    color: inherit;
  }
  input:focus-visible {
    outline-color: currentColor;
  }
  .hint {
    font-size: 11px;
  }
  .result {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .label {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 11px;
  }
  .label :global(.format) {
    color: inherit;
  }
  .surface :global(.big) {
    font-size: 44px;
    line-height: 1.05;
    font-weight: 300;
    letter-spacing: -0.03em;
    overflow-wrap: anywhere;
  }
  .rows.first {
    margin-top: 0;
  }
  .rows.first .row:first-child {
    border-top: 0;
    padding-top: 0;
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
