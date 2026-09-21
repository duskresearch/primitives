<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Slider from '@/components/tool/Slider.svelte';
  import {blur} from '@duskresearch/primitives/design/light';
  import {setQuery} from '@/lib/client/harness';
  import LightColors from '../LightColors.svelte';
  import {serializeWith,type LightState} from '../state';
  let {initial,own}:{initial:LightState;own:{radius:number;alpha:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<LightState>({...initial});
  // svelte-ignore state_referenced_locally
  let radius=$state(own.radius),alpha=$state(own.alpha);
  const answer=$derived(blur({...s,radius,alpha}));
  let loaded=false;$effect(()=>{const q=serializeWith(s,{radius,alpha});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><div class="backdrop"><div class="backdrop-lines"></div><div class="specimen" style={`${answer.css}color:${s.foreground}`}>A translucent panel<br><small>over a fixed backdrop</small></div></div><div class="rows"><div class="row"><span>Modeled uniform sample</span><Copy value={`${answer.contrast}:1`} label="modeled sample contrast">{answer.contrast}:1</Copy></div><div class="row"><span>Composite on {answer.sampleBackdrop}</span><Copy value={answer.composite} label="sample composite">{answer.composite}</Copy></div></div><div class="block"><p>Backdrop CSS</p><Copy value={answer.css} label="blur CSS" primary class="code">{answer.css}</Copy></div></div>
<div class="panel"><LightColors bind:value={s}/><Slider group="Blur radius" label="Blur" bind:value={radius} min={0} max={40} step={1} format={(n)=>`${n}px`}/><Slider group="Panel alpha" label="Alpha" bind:value={alpha} min={0} max={1} step={.01} format={(n)=>n.toFixed(2)}/><div class="block"><p>Solid fallback</p><Copy value={answer.fallback} label="solid fallback" class="code">{answer.fallback}</Copy></div><p class="mono note">Contrast is only for text {answer.text} over a uniform {answer.sampleBackdrop} backdrop composited with the chosen background. Blur over other content can differ.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}.backdrop{position:relative;min-height:200px;background:#d8d4c9;display:grid;place-items:center;overflow:hidden}.backdrop-lines{position:absolute;inset:0;background:repeating-linear-gradient(135deg,transparent 0 18px,#b8b4a8 18px 22px,transparent 22px 40px)}.specimen{position:relative;padding:25px;border:1px solid var(--line-2);font-size:20px;text-align:center}.specimen small{font-size:12px}.surface :global(.code),.panel :global(.code){max-height:100px;text-align:left;overflow:auto}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}.panel :global(.slider){grid-template-columns:48px minmax(0,1fr) 48px}</style>
