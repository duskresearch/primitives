<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Select from '@/components/tool/Select.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { layout, LAYOUT_PRESETS, type LayoutPreset } from '@duskresearch/primitives/design/grid';
  import Preview, { type PreviewColors } from '../Preview.svelte';
  import { serializeWith, type GridState } from '../state';

  let { initial, own, colors }: { initial: GridState; own: { preset: LayoutPreset; width: number; collapse: number; sidebar: number }; colors: PreviewColors } = $props();
  // svelte-ignore state_referenced_locally
  let grid = $state<GridState>({ ...initial });
  // svelte-ignore state_referenced_locally
  let settings = $state({ ...own });
  const answer = $derived(layout({ ...grid, ...settings }));
  const names: Record<LayoutPreset, string> = { sidebar: 'Sidebar', 'holy-grail': 'Holy grail', dashboard: 'Dashboard' };
  const rows = $derived(answer.collapsed ? answer.mobileAreas : answer.desktopAreas);
  const previewHeight = $derived(answer.collapsed ? answer.regions.length * 48 + (answer.regions.length - 1) * grid.gap + 12 : 168);

  let loaded = false;
  $effect(() => {
    const query = serializeWith(grid, settings);
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface">
  <div class="preview-group">
    <p class="mono key">{names[settings.preset]} · {answer.collapsed ? 'single column' : 'wide layout'}</p>
    <Preview css={answer.css} width={settings.width} html={answer.html} {colors} height={previewHeight} />
    <div class="area-readout">
      <span class="mono key">Area map at <Copy value={`${settings.width}px`} label="simulated viewport">{settings.width}px</Copy></span>
      <div class="area-rows" aria-label="Grid area map">
        {#each rows as row}
          <Copy value={row.join(' ')} label="grid area row" class="area-line">{row.join(' · ')}</Copy>
        {/each}
      </div>
    </div>
  </div>
  <div class="outputs">
    <div class="block">
      <p>Layout CSS</p>
      <Copy value={answer.css} label="layout CSS" primary class="code">{answer.css}</Copy>
    </div>
    <div class="block">
      <p>HTML in reading order</p>
      <Copy value={answer.html} label="layout HTML" class="code">{answer.html}</Copy>
    </div>
  </div>
</div>

<div class="panel">
  <div class="control-group">
    <p class="mono key">Page skeleton</p>
    <Select label="Layout preset" options={LAYOUT_PRESETS} {names} bind:value={settings.preset} />
    <Slider group="Gap" label="Gap" bind:value={grid.gap} min={0} max={64} step={1} format={(n) => `${n}px`} />
    <Slider group="Margin" label="Pad" bind:value={grid.margin} min={0} max={96} step={1} format={(n) => `${n}px`} />
    <Slider group="Maximum width" label="Max" bind:value={grid.max} min={320} max={2560} step={1} format={(n) => `${n}px`} />
  </div>
  <div class="control-group">
    <p class="mono key">Responsive behavior</p>
    <Slider group="Sidebar width" label="Side" bind:value={settings.sidebar} min={120} max={400} step={1} format={(n) => `${n}px`} />
    <Slider group="Collapse width" label="At" bind:value={settings.collapse} min={320} max={1600} step={1} format={(n) => `${n}px`} />
    <Slider group="Viewport width" label="View" bind:value={settings.width} min={240} max={2560} step={1} format={(n) => `${n}px`} />
  </div>
  <div class="rows">
    <div class="row"><span>Regions</span><Copy value={answer.regions.join(', ')} label="layout regions">{answer.regions.join(', ')}</Copy></div>
    <div class="row"><span>Fit</span>{#if answer.fits}<span>Fits available width</span>{:else}<Copy value={`${answer.overflow}px`} label="layout overflow" class="warning">Over by {answer.overflow}px</Copy>{/if}</div>
    {#if !answer.fits}
      <p class="warning note">Fixed sidebars and gaps exceed the content width by <Copy value={`${answer.overflow}px`} label="layout overflow">{answer.overflow}px</Copy>. The CSS remains unchanged so the conflict is visible.</p>
    {/if}
  </div>
</div>

<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start;gap:18px}
  .preview-group{display:flex;flex-direction:column;gap:8px;min-width:0}
  .key{font-size:11px;color:var(--ink-2)}
  .area-readout{display:flex;gap:8px;align-items:baseline;min-width:0}
  .area-rows{display:flex;flex-wrap:wrap;gap:3px;min-width:0}
  .area-rows :global(.area-line){padding:2px 6px;background:var(--paper);border:1px solid var(--line-2);font-family:var(--mono);font-size:11px;color:var(--ink);white-space:nowrap}
  .outputs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;min-width:0}
  .outputs>.block{min-width:0}
  .surface :global(.code){width:100%;max-height:92px;text-align:left;overflow:auto}
  .control-group{display:flex;flex-direction:column;gap:12px}
  .control-group :global(.slider){grid-template-columns:38px minmax(0,1fr) 48px}
  .warning{color:var(--fail)!important}
  .note{font-size:11px;line-height:1.45}
  @media(max-width:800px){.area-readout{display:block}.area-rows{margin-top:5px}}
</style>
