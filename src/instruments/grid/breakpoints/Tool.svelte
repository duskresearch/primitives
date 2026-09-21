<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { breakpoints } from '@duskresearch/primitives/design/grid';
  import Preview, { type PreviewColors } from '../Preview.svelte';
  import { serializeWith, type GridState } from '../state';
  import type { BreakpointsOwn } from '../defaults';

  let { initial, own, colors }: { initial: GridState; own: BreakpointsOwn; colors: PreviewColors } = $props();
  // svelte-ignore state_referenced_locally
  let grid = $state<GridState>({ ...initial });
  // svelte-ignore state_referenced_locally
  let settings = $state<BreakpointsOwn>({ ...own });
  const answer = $derived(breakpoints({ ...grid, ...settings }));
  const preview = $derived(`<div class="grid">${Array.from({ length: answer.active.cols }, () => '<div></div>').join('')}</div>`);
  const activeRange = $derived(answer.active.max === null ? `${answer.active.min}px and wider` : `${answer.active.min}–${answer.active.max}px`);

  let loaded = false;
  $effect(() => {
    const query = serializeWith(grid, { ...settings });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface">
  <Preview css={answer.css} width={settings.width} html={preview} {colors} height={108} />
  <div class="active-result">
    <div class="mono active-label">Current range</div>
    <div class="active-values"><Copy value={answer.active.name} label="breakpoint name">{answer.active.name}</Copy><Copy value={`${answer.active.cols}`} label="column count">{answer.active.cols} {answer.active.cols === 1 ? 'column' : 'columns'}</Copy></div>
    <Copy value={activeRange} label="breakpoint range" class="range">{activeRange}</Copy>
  </div>
  <div class="block">
    <p>Media query set</p>
    <Copy value={answer.css} label="media query set" primary class="code">{answer.css}</Copy>
  </div>
</div>

<div class="panel">
  <div class="control-group">
    <p class="mono key">Test width</p>
    <Slider group="Simulated viewport width" label="Width" bind:value={settings.width} min={240} max={2560} step={1} format={(n) => `${n}px`} />
  </div>
  <div class="control-group">
    <p class="mono key">Minimum widths · px</p>
    <Slider group="sm minimum width" label="sm" bind:value={settings.sm} min={240} max={settings.md - 1} step={1} format={(n) => `${n}px`} />
    <Slider group="md minimum width" label="md" bind:value={settings.md} min={settings.sm + 1} max={settings.lg - 1} step={1} format={(n) => `${n}px`} />
    <Slider group="lg minimum width" label="lg" bind:value={settings.lg} min={settings.md + 1} max={settings.xl - 1} step={1} format={(n) => `${n}px`} />
    <Slider group="xl minimum width" label="xl" bind:value={settings.xl} min={settings.lg + 1} max={settings.xxl - 1} step={1} format={(n) => `${n}px`} />
    <Slider group="2xl minimum width" label="2xl" bind:value={settings.xxl} min={settings.xl + 1} max={2560} step={1} format={(n) => `${n}px`} />
    <p class="note">Tailwind-inspired pixel equivalents. These are width ranges, not device types.</p>
  </div>
  <div class="control-group grid-controls">
    <p class="mono key">Layout grid</p>
    <Slider group="Columns" label="Cols" bind:value={grid.cols} min={1} max={24} step={1} format={(n) => String(n)} />
    <Slider group="Gap" label="Gap" bind:value={grid.gap} min={0} max={64} step={1} format={(n) => `${n}px`} />
    <Slider group="Margin" label="Pad" bind:value={grid.margin} min={0} max={96} step={1} format={(n) => `${n}px`} />
    <Slider group="Maximum width" label="Max" bind:value={grid.max} min={320} max={2560} step={1} format={(n) => `${n}px`} />
  </div>
  <div class="range-policy">
    <p class="mono key">Columns by range</p>
    {#each answer.ranges as range}
      <div class:current={range.name === answer.active.name} class="policy-item"><span>{range.name}</span><Copy value={`${range.cols}`} label={`${range.name} column count`}>{range.cols}</Copy></div>
    {/each}
  </div>
</div>

<style>
  :global(.tool) .surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start;gap:12px}
  .active-result{display:flex;flex-direction:column;gap:4px;min-width:0}
  .active-label,.key{font-size:11px;color:var(--ink-2)}
  .active-values{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:var(--mono);font-size:11px}
  .active-values :global(.copy:first-child){font-family:var(--font-hanken);font-size:28px;line-height:1.1;color:var(--ink)}
  .active-result :global(.range){align-self:flex-start;font-family:var(--mono);font-size:11px;color:var(--ink-2)}
  .surface :global(.code){width:100%;max-height:80px;text-align:left;overflow:auto}
  :global(.tool) .panel{gap:16px}
  .control-group{display:flex;flex-direction:column;gap:8px}
  .grid-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:12px}
  .grid-controls .key{grid-column:1/-1}
  .control-group :global(.slider){grid-template-columns:38px minmax(0,1fr) 48px}
  .grid-controls :global(.slider){grid-template-columns:27px minmax(0,1fr) 38px;gap:5px}
  .note{font-size:11px;line-height:1.45;color:var(--ink-2)}
  .range-policy{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:2px 6px}
  .range-policy .key{grid-column:1/-1;margin-bottom:4px}
  .policy-item{display:flex;justify-content:space-between;gap:2px;padding:3px 0;font-family:var(--mono);font-size:11px;color:var(--ink-2)}
  .policy-item.current{color:var(--ink)}
  .policy-item :global(.copy){color:var(--ink)}
  @media (min-width:640px) and (max-width:1000px){.grid-controls{grid-template-columns:minmax(0,1fr)}}
  @media (max-width:639px){:global(.tool) .surface{min-height:0;padding:20px;gap:10px}.active-values :global(.copy:first-child){font-size:24px}.range-policy{grid-template-columns:repeat(3,minmax(0,1fr))}}
</style>
