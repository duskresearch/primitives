<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { corner } from '@duskresearch/primitives/design/shape';
  import { serializeWith, type ShapeState } from '../state';
  let { initial, own }: { initial: ShapeState; own: {cornerRadius:number;smoothing:number} } = $props();
  // svelte-ignore state_referenced_locally
  const shared = initial;
  // svelte-ignore state_referenced_locally
  let s = $state({...own});
  const answer = $derived(corner({...shared,...s}));
  let loaded=false;
  $effect(()=>{const query=serializeWith(shared,s);if(loaded)setQuery(query);loaded=true});
</script>
<div class="surface">
  <div class="comparison"><div><svg viewBox="0 0 100 100" role="img" aria-label="Superellipse-based corner" fill="var(--accent-shape)"><path d={answer.path}/></svg><span>Superellipse K={1+s.smoothing}</span></div><div><div class="rounded" style:border-radius={`${s.cornerRadius}%`}></div><span>Standard round</span></div></div>
  <div class="block"><p>Closed SVG path</p><Copy value={answer.path} label="SVG path" primary class="code">{answer.path}</Copy></div>
</div>
<div class="panel">
  <Slider group="Corner radius percent" label="Radius" bind:value={s.cornerRadius} min={0} max={50} step={1} format={(n)=>`${n}%`}/>
  <Slider group="Superellipse smoothing" label="Smooth" bind:value={s.smoothing} min={0} max={1} step={0.01} format={(n)=>n.toFixed(2)}/>
  <p class="note">Shared radius describes a shape's circumradius; this corner radius is separate. K=1 is round, K=2 is squircle. This is not the Apple or Figma corner algorithm.</p>
  <div class="block"><p>CSS Borders 4 progressive rule</p><Copy value={answer.css} label="corner CSS" class="code">{answer.css}</Copy></div>
  <p class="note">The draft corner-shape property needs browser support. SVG is the portable output. The path samples the specified curve at 16 segments per corner.</p>
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);gap:14px}.comparison{display:flex;gap:18px;justify-content:space-around;align-items:center;flex:1}.comparison>div{min-width:0;flex:1;display:grid;justify-items:center;gap:8px}.comparison svg,.rounded{width:min(100%,150px);aspect-ratio:1}.rounded{background:var(--line-3)}.comparison span,.note{font-family:var(--mono);font-size:11px;line-height:1.5;color:var(--ink-2)}.surface :global(.code),.panel :global(.code){max-height:75px;text-align:left;overflow:auto}.panel :global(.slider){grid-template-columns:50px minmax(0,1fr) 44px}
</style>
