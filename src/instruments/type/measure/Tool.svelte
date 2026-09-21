<script lang="ts" module>
  export interface MeasureOwn {
    size: number;
    leading: number;
    width: number;
  }
</script>

<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { bandOf, MEASURE } from '@duskresearch/primitives/design/type';
  import FontField from '../FontField.svelte';
  import { familyFor, type Font } from '../fonts';
  import { serializeWith, type TypeState } from '../state';

  // seed: the chosen face, from the page, so its file loads without the full list.
  let { initial, own, seed }: { initial: TypeState; own: MeasureOwn; seed?: Font } = $props();
  // svelte-ignore state_referenced_locally
  let t = $state<TypeState>({ ...initial });
  // svelte-ignore state_referenced_locally
  let s = $state<MeasureOwn>({ ...own });

  const PARAGRAPH =
    'Reading is a rhythm: the eye runs along a line, then swings back to find the start of the next. When lines run long, that swing gets harder, and readers lose their place or read the same line twice. When lines run short, the eye jumps back so often that the text feels choppy and hyphens pile up at the edge. Somewhere in between, reading stops being work. Drag the edge of this paragraph and watch the count: most readers settle between forty-five and seventy-five characters a line.';

  let family = $state('var(--font-hanken), sans-serif');
  $effect(() => void familyFor(t.font, seed).then((f) => (family = f)));

  // Characters per line, measured on the paragraph as set: its length over its lines.
  let paragraph = $state<HTMLParagraphElement>();
  let zero = $state<HTMLSpanElement>();
  let perLine = $state(0);
  function count() {
    if (!paragraph) return;
    const lines = Math.max(1, Math.round(paragraph.getBoundingClientRect().height / (s.size * s.leading)));
    perLine = Math.round(PARAGRAPH.length / lines);
  }
  $effect(() => {
    void [s.size, s.leading, s.width, family];
    requestAnimationFrame(count);
  });
  $effect(() => {
    if (!paragraph) return;
    const observer = new ResizeObserver(count);
    observer.observe(paragraph);
    document.fonts.ready.then(count);
    return () => observer.disconnect();
  });

  const band = $derived(bandOf(perLine));
  const bandWords = { short: 'Short', comfortable: 'Comfortable', long: 'Long', 'too long': 'Too long' };
  const css = $derived(`max-width: ${s.width}ch;`);

  // Drag the paragraph's edge: its width in ch is the pointer's distance, less the handle's
  // padding, over one "0".
  let dragging = false;
  function drag(e: PointerEvent) {
    if (!dragging || !paragraph || !zero) return;
    const px = e.clientX - paragraph.getBoundingClientRect().left - parseFloat(getComputedStyle(paragraph).paddingRight);
    s.width = Math.min(120, Math.max(15, Math.round(px / zero.getBoundingClientRect().width)));
  }

  let loaded = false;
  $effect(() => {
    const query = serializeWith(t, { ...s });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface">
  <p class="labels mono">
    <span>{perLine} characters a line</span>
    <span class:fail={band === 'too long'}>{bandWords[band]}</span>
  </p>
  <div class="sheet">
    <p bind:this={paragraph} class="paragraph" style:font-family={family} style:font-size={`${s.size}px`} style:line-height={s.leading} style:width={`${s.width}ch`}>
      {PARAGRAPH}<span
        class="handle"
        role="presentation"
        onpointerdown={(e) => {
          dragging = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onpointermove={drag}
        onpointerup={() => (dragging = false)}
      ></span>
    </p>
    <span bind:this={zero} class="zero" style:font-family={family} style:font-size={`${s.size}px`} aria-hidden="true">0</span>
  </div>
  <Copy value={css} label="max-width" primary class="big">{css}</Copy>
</div>

<div class="panel">
  <FontField bind:font={t.font} known={seed} />
  <div class="group" role="group" aria-label="Paragraph">
    <p class="mono key">Size, leading, width</p>
    <Slider group="Font size" label="px" bind:value={s.size} min={12} max={32} step={1} format={(v) => `${v}px`} />
    <Slider group="Leading" label="lh" bind:value={s.leading} min={1} max={2} step={0.05} format={(v) => v.toFixed(2)} />
    <Slider group="Width" label="ch" bind:value={s.width} min={15} max={120} step={1} format={(v) => `${v}ch`} />
  </div>
  <div class="rows">
    <div class="row"><span>Comfortable</span><span>{MEASURE.min} to {MEASURE.max} a line, {MEASURE.ideal} ideal</span></div>
    <div class="row"><span>WCAG 1.4.8</span><span class:fail={perLine > MEASURE.wcag}>{perLine > MEASURE.wcag ? 'Over' : 'Within'} {MEASURE.wcag}</span></div>
  </div>
</div>

<style>
  .surface {
    background: var(--paper-2);
    border: 1px solid var(--line-2);
  }
  .labels {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    font-size: 11px;
    color: var(--ink-2);
  }
  .fail {
    color: var(--fail);
  }
  /* The paragraph is set at exactly the width copied, so the count is true to the CSS; a
     width wider than the view scrolls rather than rewraps. */
  .sheet {
    position: relative;
    min-width: 0;
    overflow-x: auto;
    padding-right: 8px;
  }
  .paragraph {
    position: relative;
    box-sizing: content-box;
    padding-right: 14px;
    color: var(--ink);
    border-right: 1px solid var(--line-3);
  }
  .handle {
    position: absolute;
    top: 0;
    right: -7px;
    bottom: 0;
    width: 14px;
    cursor: ew-resize;
    touch-action: none;
  }
  .handle::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 5px;
    width: 4px;
    height: 32px;
    margin-top: -16px;
    background: var(--ink);
  }
  .zero {
    position: absolute;
    visibility: hidden;
  }
  .surface :global(.big) {
    align-self: flex-start;
    font-size: 44px;
    line-height: 1.05;
    font-weight: 300;
    letter-spacing: -0.03em;
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .key {
    font-size: 11px;
    color: var(--ink-2);
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
