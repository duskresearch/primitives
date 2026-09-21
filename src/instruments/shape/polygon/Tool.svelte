<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import NumberField from '@/components/tool/NumberField.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { polygon, presetPoints, POLYGON_PRESETS, type Point, type PolygonPreset } from '@duskresearch/primitives/design/shape';
  import ShapeColorControls from '../ShapeColorControls.svelte';
  import { pointsString, serializeWith, type ShapeState } from '../state';
  let { initial, own }: { initial: ShapeState; own: { preset: PolygonPreset; points: Point[] } } = $props();
  // svelte-ignore state_referenced_locally
  let shared = $state<ShapeState>({...initial});
  // svelte-ignore state_referenced_locally
  let preset = $state(own.preset);
  // svelte-ignore state_referenced_locally
  let points = $state<Point[]>(own.points.map((p) => ({...p})));
  const answer = $derived(polygon({ ...shared, points }));
  function choose(next: PolygonPreset) { preset = next; if (next !== 'custom') points = presetPoints(shared, next); }
  function edit(index: number, axis: 'x'|'y', value: number) { points[index][axis] = Number(value.toFixed(2)); preset = 'custom'; }
  let loaded = false;
  $effect(() => { const query = serializeWith(shared, { preset, points: pointsString(points) }); if (loaded) setQuery(query); loaded = true; });
</script>
<div class="surface">
  <div class="clip-preview"><div class="clipped" style:clip-path={answer.css.slice('clip-path: '.length, -1)} style:background-color={shared.foreground}></div></div>
  <p class="mono note">{points.length} ordered vertices · nonzero fill rule</p>
  <div class="block"><p>CSS declaration</p><Copy value={answer.css} label="clip-path" primary class="code">{answer.css}</Copy></div>
</div>
<div class="panel">
  <ShapeColorControls bind:foreground={shared.foreground}/>
  <div class="block"><p>Colored CSS</p><Copy value={answer.coloredCss} label="colored clip-path CSS" class="code">{answer.coloredCss}</Copy></div>
  <p class="mono note">Preset: {preset}</p>
  {#if preset === 'star' && shared.sides > 6}<p class="note">Star preset uses six tips to stay within twelve vertices. Shared sides remain {shared.sides}.</p>{/if}
  <div class="presets">{#each POLYGON_PRESETS.filter((p)=>p!=='custom') as option}<button type="button" aria-pressed={preset===option} onclick={()=>choose(option)}>{option}</button>{/each}</div>
  <div class="points"><p class="mono note">Points · X / Y percent</p>{#each points as point, i (i)}
    <div class="point"><span class="mono">{i+1}</span><NumberField label="X" name={`Point ${i+1} X percent`} value={point.x} min={0} max={100} places={2} onchange={(v)=>edit(i,'x',v)}/><NumberField label="Y" name={`Point ${i+1} Y percent`} value={point.y} min={0} max={100} places={2} onchange={(v)=>edit(i,'y',v)}/><button type="button" disabled={points.length<=3} aria-label={`Remove point ${i+1}`} onclick={()=>{points.splice(i,1);preset='custom'}}>−</button></div>
  {/each}<button type="button" disabled={points.length>=12} onclick={()=>{points.push({x:50,y:50});preset='custom'}}>+ Add point</button></div>
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);gap:14px}.clip-preview{flex:1;display:grid;place-items:center;min-height:160px}.clipped{width:min(100%,210px);aspect-ratio:1;background:var(--accent-shape)}
  .note{font-size:11px;color:var(--ink-2)}.surface :global(.code){max-height:75px;text-align:left;overflow:auto}.points{display:flex;flex-direction:column;gap:7px}.point{display:grid;grid-template-columns:15px minmax(0,1fr) minmax(0,1fr) 24px;gap:8px;align-items:center}.point>button,.points>button{border:1px solid var(--line-2);background:var(--paper);color:var(--ink);cursor:pointer}.point>button:disabled,.points>button:disabled{opacity:.4;cursor:default}.points>button{align-self:flex-start;padding:6px}.presets{display:flex;flex-wrap:wrap;gap:8px}.presets button{border:0;background:none;color:var(--ink);text-transform:capitalize;text-decoration:underline;cursor:pointer;font-size:11px}
</style>
