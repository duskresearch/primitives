<script lang="ts">
  let { samples, timing, duration, distance = 200 }: { samples:{at:number;value:number}[]; timing:string; duration:number; distance?:number } = $props();
  const path = $derived(samples.map(({at,value})=>`${(at*240).toFixed(2)},${(150-value*120).toFixed(2)}`).join(' '));
  let running = $state(false);
  let run = $state(0);
  function play(){running=false;run++;requestAnimationFrame(()=>{running=true;});}
</script>
<div class="motion-preview">
  <svg viewBox="0 0 260 180" role="img" aria-label="Curve against a linear diagonal">
    <path d="M10 150H250M10 30V150" fill="none" stroke="var(--line-3)"/>
    <path d="M10 150L250 30" fill="none" stroke="var(--line-3)" stroke-dasharray="4 4"/>
    <polyline points={path} transform="translate(10 0)" fill="none" stroke="var(--ink)" stroke-width="2"/>
  </svg>
  <div class="tracks" style={`--travel:${distance}px;--time:${duration}ms;--timing:${timing}`}>
    <div class="track"><span class="mono">Curve</span>{#key run}<span class:playing={running} class="dot curved"></span>{/key}</div>
    <div class="track"><span class="mono">Linear</span>{#key run}<span class:playing={running} class="dot linear"></span>{/key}</div>
  </div>
  <div class="actions"><button type="button" onclick={play}>Play</button><button type="button" onclick={()=>{running=false;run++;}}>Reset</button></div>
  <p class="mono note">The graph remains visible with reduced motion. Playback starts only when requested.</p>
</div>
<style>
  .motion-preview{width:100%;display:flex;flex-direction:column;gap:12px}
  svg{width:100%;max-width:280px;height:160px}
  .tracks{display:flex;flex-direction:column;gap:14px;width:100%;overflow:hidden}
  .track{position:relative;min-height:26px;padding-left:50px;border-bottom:1px solid var(--line-2)}
  .track>span:first-child{position:absolute;left:0;top:7px;font-size:11px;color:var(--ink-2)}
  .dot{display:block;width:20px;height:20px;background:var(--ink);border-radius:50%;transform:translateX(0)}
  .dot.playing.curved{animation:travel var(--time) var(--timing) both}
  .dot.playing.linear{animation:travel var(--time) linear both}
  @keyframes travel{to{transform:translateX(min(var(--travel),calc(100vw - 170px)))}}
  .actions{display:flex;gap:16px}.actions button{text-decoration:underline;text-underline-offset:3px}
  .note{font-size:11px;color:var(--ink-2)}
  @media(prefers-reduced-motion:reduce){.dot.playing.curved,.dot.playing.linear{animation:none;transform:translateX(min(var(--travel),calc(100vw - 170px)))}}
</style>
