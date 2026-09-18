<script lang="ts">
  import Choice from '@/components/tool/Choice.svelte';
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { BLEND_MODES, blendCss, blendOf, formatAs, hex, lchOf, type BlendMode, type CssFormat, type Lch } from '@duskresearch/primitives/design/color';
  import { serializeWith, type ColorState } from '../state';
  import { textOn } from '../ui';
  import ColorControls from '../ColorControls.svelte';

  let { initial, mode: initialMode, amount: initialAmount }: { initial: ColorState; mode: BlendMode; amount: number } = $props();

  // A is the top layer, B the backdrop.
  // svelte-ignore state_referenced_locally
  let a = $state<Lch>({ ...initial.a });
  // svelte-ignore state_referenced_locally
  let b = $state<Lch>({ ...initial.b });
  // svelte-ignore state_referenced_locally
  let mode = $state<BlendMode>(initialMode);
  // svelte-ignore state_referenced_locally
  let amount = $state(initialAmount);

  const names: Record<BlendMode, string> = { mix: 'Mix', opacity: 'Opacity', multiply: 'Multiply', screen: 'Screen', overlay: 'Overlay' };
  let aFormat = $state<CssFormat>('hex');
  let bFormat = $state<CssFormat>('hex');

  // Each layer is written in its own format; the result in the top layer's.
  const result = $derived(lchOf(blendOf(a, b, mode, amount / 100)));
  const resultHex = $derived(hex(result));
  const resultValue = $derived(formatAs(result, aFormat));
  const css = $derived(blendCss(a, b, mode, amount / 100, { top: aFormat, bottom: bFormat }));
  const aHex = $derived(hex(a));
  const bHex = $derived(hex(b));
  // Mix and opacity are interpolations: show both spaces, so the muddy middle is plain to see.
  const strips = $derived(mode === 'mix' || mode === 'opacity');
  const pct = (v: number) => `${Math.round(v)}%`;

  let loaded = false;
  $effect(() => {
    const query = serializeWith({ a, b }, { mode, amount });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<!-- Chips like Scale's swatches: small labels on paper, so they read on any color. The result's
     hex is large text, which ink or paper always carries on the color itself. -->
<div class="surface bleed">
  <div class="layers">
    <button type="button" class="layer" data-copy={formatAs(a, aFormat)} data-copy-label={aFormat}>
      <span class="visually-hidden">Copy top color </span>
      <span class="chip" style:background-color={aHex}></span>
      <span class="label mono"><span class="muted" aria-hidden="true">A</span><span>{formatAs(a, aFormat)}</span></span>
    </button>
    <div class="layer">
      <div class="chip result" style:background-color={resultHex} style:color={textOn(result)}>
        <Copy value={resultValue} label={aFormat} primary class={resultValue.length > 9 ? 'big long' : 'big'}>{resultValue}</Copy>
      </div>
      <span class="label mono"><span class="muted">{names[mode]}</span><span>{pct(amount)}</span></span>
    </div>
    <button type="button" class="layer" data-copy={formatAs(b, bFormat)} data-copy-label={bFormat}>
      <span class="visually-hidden">Copy bottom color </span>
      <span class="chip" style:background-color={bHex}></span>
      <span class="label mono"><span class="muted" aria-hidden="true">B</span><span>{formatAs(b, bFormat)}</span></span>
    </button>
  </div>
  {#if strips}
    <div class="strips mono" aria-hidden="true">
      {#each [['oklch', 'OKLCH', mode === 'mix'], ['srgb', 'sRGB', mode === 'opacity']] as const as [space, label, used] (space)}
        <div class="strip-row" class:used>
          <span>{label}</span>
          <div class="strip" style:background-image={`linear-gradient(to right in ${space}, ${aHex}, ${bHex})`}>
            <i style:left={pct(100 - amount)}></i>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<div class="panel">
  <ColorControls name="Top" key="A" bind:color={a} bind:format={aFormat} />
  <ColorControls name="Bottom" key="B" bind:color={b} bind:format={bFormat} />
  <Choice label="Mode" options={BLEND_MODES} {names} bind:value={mode} />
  <div class="amount" role="group" aria-label="Amount">
    <p class="mono">Amount</p>
    <Slider group="Amount of" label="A" bind:value={amount} min={0} max={100} step={1} format={pct} />
  </div>
  <div class="rows">
    <div class="row"><span>CSS</span><Copy value={css} label="CSS">{css}</Copy></div>
  </div>
</div>

<style>
  .layers {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    min-height: 0;
  }
  .layer {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 0;
    border: 0;
    background: var(--paper-2);
    text-align: left;
  }
  button.layer {
    cursor: copy;
  }
  button.layer:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: -2px;
    box-shadow: inset 0 0 0 4px var(--paper);
  }
  .chip {
    flex: 1;
    min-height: 0;
    transition:
      background-color var(--dur-color),
      color var(--dur-color);
  }
  .result {
    display: flex;
    align-items: flex-end;
    padding: 20px 14px;
  }
  .result :global(.big) {
    font-size: 44px;
    line-height: 1.05;
    font-weight: 300;
    letter-spacing: -0.03em;
    overflow-wrap: anywhere;
  }
  /* rgb(), hsl() and oklch() are long for this column: the title28 size keeps them on it. */
  .result :global(.big.long) {
    font-size: 28px;
    line-height: 1.1;
    font-weight: 400;
    letter-spacing: -0.02em;
  }
  .label {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 14px;
    font-size: 11px;
    color: var(--ink);
  }
  .muted {
    flex: none;
    color: var(--ink-2);
  }
  .label span:last-child {
    min-width: 0;
    text-align: right;
    overflow-wrap: anywhere;
  }
  .strips {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 16px;
    font-size: 11px;
    color: var(--ink-2);
  }
  .strip-row {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 12px;
    align-items: center;
  }
  .strip-row.used {
    color: var(--ink);
  }
  .strip {
    position: relative;
    height: 20px;
  }
  .strip i {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 2px;
    margin-left: -1px;
    background: var(--ink);
  }
  .amount {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .amount p {
    font-size: 11px;
    color: var(--ink-2);
  }
  @media (max-width: 719px) {
    .result :global(.big) {
      font-size: 28px;
      line-height: 1.1;
      font-weight: 400;
      letter-spacing: -0.02em;
    }
  }
  @media (max-width: 639px) {
    .layers {
      min-height: 240px;
    }
    .label {
      flex-direction: column;
      gap: 2px;
    }
  }
</style>
