<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import NumberField from '@/components/tool/NumberField.svelte';
  import {inset} from '@duskresearch/primitives/design/space';
  import {setQuery} from '@/lib/client/harness';
  import {serializeWith,type SideState,type SpaceState} from '../state';
  let {initial,own}:{initial:SpaceState;own:SideState}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<SpaceState>({...initial});
  // svelte-ignore state_referenced_locally
  let sides=$state<SideState>({...own});
  const answer=$derived(inset({padding:{top:sides.pt,right:sides.pr,bottom:sides.pb,left:sides.pl},margin:{top:sides.mt,right:sides.mr,bottom:sides.mb,left:sides.ml}}));
  let loaded=false;$effect(()=>{const q=serializeWith(s,sides);if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface">
  <div class="inset-preview"><div class="card" style={`padding:${answer.padding};margin:${answer.margin}`}><strong>Card sample</strong><p>Padding sits inside the border. Margin sits outside it.</p></div></div>
  <div class="rows">
    <div class="row"><span>Padding</span><Copy value={answer.padding} label="padding">{answer.padding}</Copy></div>
    <div class="row"><span>Margin</span><Copy value={answer.margin} label="margin">{answer.margin}</Copy></div>
  </div>
  <div class="block"><p>CSS physical-side shorthand</p><Copy value={answer.css} label="inset CSS" primary class="code">{answer.css}</Copy></div>
</div>
<div class="panel">
  <p class="mono key">Padding · top, right, bottom, left</p>
  <div class="side-fields"><NumberField label="T" name="Padding top" value={sides.pt} min={0} max={256} onchange={(v)=>sides.pt=v}/><NumberField label="R" name="Padding right" value={sides.pr} min={0} max={256} onchange={(v)=>sides.pr=v}/><NumberField label="B" name="Padding bottom" value={sides.pb} min={0} max={256} onchange={(v)=>sides.pb=v}/><NumberField label="L" name="Padding left" value={sides.pl} min={0} max={256} onchange={(v)=>sides.pl=v}/></div>
  <p class="mono key">Margin · negative values allowed</p>
  <div class="side-fields"><NumberField label="T" name="Margin top" value={sides.mt} min={-256} max={256} onchange={(v)=>sides.mt=v}/><NumberField label="R" name="Margin right" value={sides.mr} min={-256} max={256} onchange={(v)=>sides.mr=v}/><NumberField label="B" name="Margin bottom" value={sides.mb} min={-256} max={256} onchange={(v)=>sides.mb=v}/><NumberField label="L" name="Margin left" value={sides.ml} min={-256} max={256} onchange={(v)=>sides.ml=v}/></div>
  <p class="mono note">The shared base, mode and root settings stay in the URL for Scale and Tokens. Inset uses its own side values.</p>
</div>
<style>
  .surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:flex-start}
  .inset-preview{min-height:150px;overflow:auto;background:var(--paper);border:1px dashed var(--line-3)}
  .card{min-width:100px;background:var(--paper-2);border:1px solid var(--ink);font-size:14px;line-height:1.4}
  .card p{margin-top:8px}.side-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 20px}
  .key,.note{font-size:11px;line-height:1.5;color:var(--ink-2)}
  .surface :global(.code){max-height:100px;text-align:left;overflow:auto}
</style>
