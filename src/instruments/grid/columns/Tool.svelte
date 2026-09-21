<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { columns } from '@duskresearch/primitives/design/grid';
  import Preview, { type PreviewColors } from '../Preview.svelte';
  import { serializeWith, type GridState } from '../state';

  let { initial, own, colors }: { initial: GridState; own: { width: number }; colors: PreviewColors } = $props();
  // svelte-ignore state_referenced_locally
  let grid = $state<GridState>({ ...initial });
  // svelte-ignore state_referenced_locally
  let width = $state(own.width);
  const answer = $derived(columns({ ...grid, width }));
  const preview = $derived(`<div class="grid">${Array.from({ length: grid.cols }, () => '<div></div>').join('')}</div>`);

  let loaded = false;
  $effect(() => {
    const query = serializeWith(grid, { width });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface">
  <Preview css={answer.css} {width} html={preview} {colors} />
  <div class="measurements rows">
    <div class="row"><span>Container</span><Copy value={`${answer.containerWidth}px`} label="container width">{answer.containerWidth}px</Copy></div>
    <div class="row"><span>Content</span><Copy value={`${answer.contentWidth}px`} label="content width">{answer.contentWidth}px</Copy></div>
    <div class="row"><span>Track</span><Copy value={`${answer.trackWidth}px`} label="track width">{answer.trackWidth}px</Copy></div>
    <div class="row"><span>Total gap</span><Copy value={`${answer.totalGap}px`} label="total gap">{answer.totalGap}px</Copy></div>
  </div>
  <div class="block">
    <p>Grid CSS</p>
    <Copy value={answer.css} label="grid CSS" primary class="code">{answer.css}</Copy>
  </div>
</div>

<div class="panel">
  <div class="control-group">
    <p class="mono key">Layout grid</p>
    <Slider group="Columns" label="Cols" bind:value={grid.cols} min={1} max={24} step={1} format={(n) => String(n)} />
    <Slider group="Gap" label="Gap" bind:value={grid.gap} min={0} max={64} step={1} format={(n) => `${n}px`} />
    <Slider group="Margin" label="Pad" bind:value={grid.margin} min={0} max={96} step={1} format={(n) => `${n}px`} />
    <Slider group="Maximum width" label="Max" bind:value={grid.max} min={320} max={2560} step={1} format={(n) => `${n}px`} />
  </div>
  <div class="control-group">
    <p class="mono key">Preview</p>
    <Slider group="Viewport width" label="Width" bind:value={width} min={240} max={2560} step={1} format={(n) => `${n}px`} />
  </div>
  <div class="rows">
    <div class="row"><span>Outer margin</span><Copy value={`${answer.outerMargin}px`} label="outer margin">{answer.outerMargin}px each side</Copy></div>
    <div class="row"><span>Fit</span><span class:warning={!answer.fits}>{#if answer.fits}Tracks fit{:else}Gaps exceed content by <Copy value={`${answer.overflow}px`} label="gap overflow">{answer.overflow}px</Copy>{/if}</span></div>
    {#if !answer.fits}
      <p class="warning note">The requested gaps take more space than the content box. The CSS still keeps all {grid.cols} columns; tracks shrink to zero.</p>
    {/if}
  </div>
</div>

<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start;gap:12px}
  .surface .measurements{margin-top:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:16px}
  .control-group{display:flex;flex-direction:column;gap:12px}
  .control-group :global(.slider){grid-template-columns:38px minmax(0,1fr) 48px}
  .key{font-size:11px;color:var(--ink-2)}
  .warning{color:var(--fail)!important}
  .note{font-size:11px;line-height:1.45}
  .surface :global(.code){width:100%;max-height:76px;text-align:left;overflow:auto}
</style>
