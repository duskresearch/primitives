<script lang="ts">
  import Choice from '@/components/tool/Choice.svelte';
  import Copy from '@/components/tool/Copy.svelte';
  import Swatches from '@/components/tool/Swatches.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { formatAs, harmonyOf, hex, RULE_NAMES, type CssFormat, type Lch, type Rule } from '@duskresearch/primitives/design/color';
  import { serializeWith, type ColorState } from '../state';
  import ColorControls from '../ColorControls.svelte';

  let { initial, rule: initialRule }: { initial: ColorState; rule: Rule } = $props();

  // svelte-ignore state_referenced_locally
  let a = $state<Lch>({ ...initial.a });
  // svelte-ignore state_referenced_locally
  const b = initial.b;
  // svelte-ignore state_referenced_locally
  let rule = $state<Rule>(initialRule);

  const names: Record<Rule, string> = { analogous: 'Analogous', complementary: 'Complementary', split: 'Split', triadic: 'Triadic', square: 'Square' };
  const describe: Record<Rule, string> = {
    analogous: 'Neighbors 30° and 60° either side',
    complementary: 'The opposite hue, 180° away',
    split: 'Either side of the opposite: 150° and 210°',
    triadic: 'Three hues 120° apart',
    square: 'Four hues 90° apart',
  };

  const colors = $derived(harmonyOf(a, rule));
  const degrees = (offset: number) => (offset === 0 ? 'base' : `${offset > 0 ? '+' : '−'}${Math.abs(offset)}°`);
  let format = $state<CssFormat>('hex');
  // Everything made from the base is written in the base's format.
  const items = $derived(colors.map((x) => ({ key: String(x.offset), name: degrees(x.offset), hex: hex(x.color), value: formatAs(x.color, format), label: format })));
  const palette = $derived(colors.map((x) => formatAs(x.color, format)).join('\n'));
  // Below this chroma there is barely a hue to turn.
  const gray = $derived(a.c < 0.02);

  let loaded = false;
  $effect(() => {
    const query = serializeWith({ a, b }, { rule });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface bleed">
  <Swatches {items} />
</div>

<div class="panel">
  <ColorControls name="Base" key="A" bind:color={a} bind:format />
  <div class="rule">
    <Choice label="Rule" options={RULE_NAMES} {names} bind:value={rule} />
    <p class="mono">{gray ? 'A gray has no hue to turn. Raise C.' : describe[rule]}</p>
  </div>
  <div class="block end">
    <p>Palette</p>
    <Copy value={palette} label="palette" primary class="code">{palette}</Copy>
  </div>
</div>

<style>
  .rule {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .rule p {
    font-size: 11px;
    color: var(--ink-2);
  }
  .end {
    margin-top: auto;
  }
</style>
