<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {gradient} from '@duskresearch/primitives/design/noise';
  import {setQuery} from '@/lib/client/harness';
  import NoiseControls from '../NoiseControls.svelte';
  import {serializeWith,type NoiseState} from '../state';
  let {initial,own}:{initial:NoiseState;own:{angle:number;frequency:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<NoiseState>({...initial});
  // svelte-ignore state_referenced_locally
  let angle=$state(own.angle),frequency=$state(own.frequency);
  const answer=$derived(gradient({...s,angle,frequency}));
  let loaded=false;$effect(()=>{const q=serializeWith(s,{angle,frequency});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><div class="preview" style={answer.css} role="img" aria-label="sRGB gradient with seeded SVG noise overlay"></div><div class="block"><p>Complete CSS with seeded noise overlay</p><Copy value={answer.css} label="noise gradient CSS" primary class="code">{answer.css}</Copy></div><div class="block"><p>Standalone SVG</p><Copy value={answer.svg} label="gradient SVG" class="code">{answer.svg}</Copy></div></div>
<div class="panel"><NoiseControls bind:value={s}/><Slider group="Gradient angle" label="Angle" bind:value={angle} min={0} max={360} step={1} format={(n)=>`${n}°`}/><Slider group="Noise frequency" label="Freq" bind:value={frequency} min={.01} max={1} step={.01} format={(n)=>n.toFixed(2)}/><div class="block"><p>Smooth fallback, without noise</p><Copy value={answer.fallback} label="smooth gradient fallback" class="code">{answer.fallback}</Copy></div><p class="mono note">Stops interpolate in sRGB. The primary CSS embeds a seeded SVG filter; the fallback is explicitly smooth, not dithered.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.preview{flex:1;min-height:180px;border:1px solid var(--line-2)}.surface :global(.code),.panel :global(.code){max-height:90px;text-align:left;overflow:auto}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}</style>
