<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import NumberField from '@/components/tool/NumberField.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { baseline } from '@duskresearch/primitives/design/grid';
  import { clampBaselineOffset, normalizeBaselineStep, serializeWith, type GridState } from '../state';
  import type { BaselineOwn } from '../defaults';

  let { initial, own }: { initial: GridState; own: BaselineOwn } = $props();
  // The shared Grid settings travel with the link; this instrument changes only its own.
  // svelte-ignore state_referenced_locally
  const shared = initial;
  // svelte-ignore state_referenced_locally
  let s = $state<BaselineOwn>({ ...own });
  const answer = $derived(baseline(s));
  const driftText = $derived(`${answer.driftPerLine > 0 ? '+' : ''}${answer.driftPerLine}px per line`);

  let loaded = false;
  $effect(() => {
    const query = serializeWith(shared, { ...s });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface">
  <div class="result">
    <p class="mono key">Vertical rhythm, line boxes</p>
    <Copy value={answer.stepCss} label="baseline step" primary class="big">{answer.stepCss}</Copy>
    <span class="mono status" class:off={!answer.aligned}>{answer.aligned ? 'Line boxes align with the overlay' : 'Line boxes do not align with the overlay'}</span>
  </div>
  <div class="rhythm" style:background-size={`100% ${s.step}px`} style:background-position-y={`${s.offset}px`}>
    <div class="sample" style:font-size={`${s.size}px`} style:line-height={`${s.leading}px`}>
      <p>Lines find rhythm.</p>
      <p>Space follows type.</p>
      <p>Each line has a place.</p>
    </div>
  </div>
  <p class="mono caption">Gray: <Copy value={`${s.step}px`} label="overlay step">{s.step}px</Copy> overlay · gold: line-box edges · Hanken Grotesk</p>
</div>

<div class="panel">
  <div class="control-group">
    <p class="mono key">Rhythm overlay</p>
    <NumberField label="Step" name="Baseline step in px" value={s.step} min={2} max={24} onchange={(n) => {
      const step = normalizeBaselineStep(n);
      s.step = step;
      s.offset = clampBaselineOffset(s.offset, step);
    }} />
    <Slider group="Overlay offset" label="Phase" bind:value={s.offset} min={0} max={s.step - 1} step={1} format={(n) => `${n}px`} />
  </div>
  <div class="control-group">
    <p class="mono key">Text</p>
    <Slider group="Font size" label="Size" bind:value={s.size} min={12} max={32} step={1} format={(n) => `${n}px`} />
    <Slider group="Line height" label="Line" bind:value={s.leading} min={12} max={64} step={1} format={(n) => `${n}px`} />
  </div>
  <div class="rows">
    <div class="row"><span>Requested line height</span><Copy value={`${s.leading}px`} label="line height">{s.leading}px</Copy></div>
    <div class="row"><span>Nearest on rhythm</span><Copy value={`${answer.recommended}px`} label="recommended line height">{answer.recommended}px</Copy></div>
    <div class="row"><span>Drift from nearest</span><Copy value={driftText} label="line-box drift">{driftText}</Copy></div>
  </div>
  {#if s.leading !== answer.recommended}
    <button type="button" class="apply mono" onclick={() => (s.leading = answer.recommended)}>Apply {answer.recommended}px line height</button>
  {/if}
  <div class="block">
    <p>CSS for these settings</p>
    <Copy value={answer.css} label="baseline CSS" class="code">{answer.css}</Copy>
  </div>
</div>

<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start;gap:12px}
  .result{display:flex;flex-direction:column;align-items:flex-start;gap:4px}
  .key,.caption{font-size:11px;color:var(--ink-2)}
  .surface :global(.big){font-size:44px;line-height:1.05;font-weight:300;letter-spacing:-.03em}
  .status{font-size:11px;color:var(--ink-2)}
  .status.off{color:var(--fail)}
  .rhythm{width:100%;min-width:0;height:150px;overflow:hidden;background-color:var(--paper);background-image:linear-gradient(to bottom,transparent calc(100% - 1px),var(--line-3) 0);box-shadow:inset 0 0 0 1px var(--line-2)}
  .sample{font-family:var(--font-hanken),var(--sans);font-weight:400;color:var(--ink)}
  .sample p{height:1lh;white-space:nowrap;overflow:hidden;text-overflow:clip;box-shadow:inset 0 -1px var(--accent-grid)}
  .control-group{display:flex;flex-direction:column;gap:10px}
  .control-group :global(.slider){grid-template-columns:38px minmax(0,1fr) 48px}
  .panel .rows{margin-top:0}
  .apply{align-self:flex-start;border:0;border-bottom:1px solid currentColor;padding:4px 0;background:none;color:var(--ink);font-size:11px}
  .panel :global(.code){width:100%;max-height:76px;text-align:left;overflow:auto}
  @media(max-width:639px){.surface :global(.big){font-size:34px}}
</style>
