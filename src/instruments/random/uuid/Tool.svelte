<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Choice from '@/components/tool/Choice.svelte';
  import {uuid} from '@duskresearch/primitives/design/random';
  import {setQuery} from '@/lib/client/harness';
  import {bytesFromHex,hexFromBytes,serializeWith,type RandomState} from '../state';
  let {initial,own}:{initial:RandomState;own:{version:'4'|'7';bytes:string;timestamp:number}}=$props();
  // svelte-ignore state_referenced_locally
  let s=$state<RandomState>({...initial});
  // svelte-ignore state_referenced_locally
  let version=$state(own.version),bytes=$state(own.bytes),timestamp=$state(own.timestamp),generatedVersion=$state('');
  const answer=$derived(uuid({version:Number(version) as 4|7,bytes:bytesFromHex(bytes),timestamp}));
  let error=$state('');
  function generate(){
    if(!globalThis.crypto?.getRandomValues){error='Browser entropy is unavailable.';return;}
    bytes=hexFromBytes(crypto.getRandomValues(new Uint8Array(16)));
    if(version==='7')timestamp=Date.now();
    generatedVersion=version;error='';
  }
  let loaded=false;$effect(()=>{const q=serializeWith(s,{version,bytes,timestamp});if(loaded)setQuery(q);loaded=true;});
</script>
<div class="surface"><Copy value={answer.value} label="UUID" primary class="uuid-value">{answer.value}</Copy><div class="rows"><div class="row"><span>Version</span><Copy value={`v${version}`} label="UUID version">v{version}</Copy></div>{#if version==='7'}<div class="row"><span>Timestamp</span><Copy value={String(timestamp)} label="UUID timestamp">{timestamp} ms since Unix epoch</Copy></div>{/if}</div><p class="mono note">{generatedVersion===version?'Generated with browser crypto on this action. URL bytes replay this ID.':bytes==='000102030405060708090a0b0c0d0e0f'?'Deterministic example bytes, not a random ID. Press Generate for a new one.':'Explicit URL bytes replay this ID; their original source is unknown.'}</p></div>
<div class="panel"><Choice label="RFC 9562 version" options={['4','7'] as const} names={{4:'v4',7:'v7'}} bind:value={version}/><button type="button" class="generate" onclick={generate}>Generate UUID</button>{#if error}<p role="alert">{error}</p>{/if}<p class="mono note">v7 uses the click-time Unix timestamp. This tool does not guarantee monotonic ordering. The shared seed stays in sibling URLs but is not used for UUID generation.</p></div>
<style>.surface.surface{background:var(--paper-2);border:1px solid var(--line-2);justify-content:center}.surface :global(.uuid-value){font:clamp(16px,3vw,24px)/1.4 var(--mono);overflow-wrap:anywhere;text-align:center}.note{font-size:11px;line-height:1.5;color:var(--ink-2)}.generate{align-self:flex-start;border:1px solid var(--ink);padding:10px 14px;font-size:13px}</style>
