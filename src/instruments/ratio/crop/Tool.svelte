<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {crop} from '@duskresearch/primitives/design/ratio';
  import {setQuery} from '@/lib/client/harness';
  import DimensionControls from '../DimensionControls.svelte';
  import {serializeWith,type RatioState} from '../state';
  let {initial,own}:{initial:RatioState;own:{preset:'square'|'portrait'|'story'|'landscape';mode:'fit'|'fill';focalX:number;focalY:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<RatioState>({...initial});
  // svelte-ignore state_referenced_locally
  let preset=$state(own.preset),mode=$state(own.mode),focalX=$state(own.focalX),focalY=$state(own.focalY);
  const answer=$derived(crop({...s,preset,mode,focalX,focalY}));
  const preview=$derived(`data:image/svg+xml,${encodeURIComponent(answer.svg)}`);
  const rect=$derived(`${answer.rect.x.toFixed(1)}, ${answer.rect.y.toFixed(1)} · ${answer.rect.width.toFixed(1)} × ${answer.rect.height.toFixed(1)}px`);
  let loaded=false;$effect(()=>{const q=serializeWith(s,{preset,mode,focalX,focalY});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  <div class="preview"><img src={preview} alt={`Built-in composition in ${preset} ${mode} frame`} width={answer.output.width} height={answer.output.height}/></div>
  <div class="rows"><div class="row"><span>Visible source area</span><Copy value={`${answer.visiblePercent.toFixed(2)}%`} label="visible source area">{answer.visiblePercent.toFixed(2)}%</Copy></div><div class="row"><span>Source crop rectangle</span><Copy value={rect} label="crop rectangle">{rect}</Copy></div></div>
  <div class="block"><p>Object placement CSS</p><Copy value={answer.css} label="crop CSS" primary class="code">{answer.css}</Copy></div>
</div>
<div class="panel"><p class="mono key">Source dimensions</p><DimensionControls bind:value={s}/><Choice label="Output ratio" options={['square','portrait','story','landscape'] as const} names={{square:'Square 1:1',portrait:'Portrait 4:5',story:'Story 9:16',landscape:'Landscape 16:9'}} bind:value={preset}/><Choice label="Fit mode" options={['fit','fill'] as const} names={{fit:'Fit',fill:'Fill'}} bind:value={mode}/><Slider group="Horizontal focal point" label="X" bind:value={focalX} min={0} max={1} step={.01} format={(n)=>`${Math.round(n*100)}%`}/><Slider group="Vertical focal point" label="Y" bind:value={focalY} min={0} max={1} step={.01} format={(n)=>`${Math.round(n*100)}%`}/><p class="mono note">Generic aspect presets, not guaranteed platform-safe areas. The composition is built in; no image is uploaded.</p></div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .preview{min-height:150px;display:grid;place-items:center;overflow:auto}.preview img{max-width:100%;max-height:240px;width:auto;height:auto;border:1px solid var(--line-2)}
  .key,.note{font-size:11px;line-height:1.5;color:var(--ink-2)}
  .panel :global(.slider){grid-template-columns:36px minmax(0,1fr) 48px}
</style>
