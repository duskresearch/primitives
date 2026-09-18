<script lang="ts">
  import Copy from '@/components/tool/Copy.svelte';
  import Swatches from '@/components/tool/Swatches.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { hex, scaleCss, scaleOf, type Lch } from '@duskresearch/primitives/design/color';
  import { serialize, type ColorState } from '../state';
  import ColorControls from '../ColorControls.svelte';

  let { initial }: { initial: ColorState } = $props();

  // svelte-ignore state_referenced_locally
  let a = $state<Lch>({ ...initial.a });
  // svelte-ignore state_referenced_locally
  const b = initial.b;

  const steps = $derived(scaleOf(a));
  const items = $derived(steps.map((s) => ({ key: s.name, name: s.name, hex: hex(s.color), note: s.base ? 'base' : undefined })));
  const css = $derived(scaleCss(steps));

  let loaded = false;
  $effect(() => {
    const query = serialize({ a, b });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface bleed">
  <Swatches {items} />
</div>

<div class="panel">
  <ColorControls name="Base" key="A" bind:color={a} />
  <div class="block end">
    <p>CSS</p>
    <Copy value={css} label="CSS" primary class="code">{css}</Copy>
  </div>
</div>

<style>
  .end {
    margin-top: auto;
  }
</style>
