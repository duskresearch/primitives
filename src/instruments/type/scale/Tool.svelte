<script lang="ts" module>
  export interface ScaleOwn {
    fluid: boolean;
    minw: number;
    maxw: number;
    minbase: number;
    minratio: number;
  }
</script>

<script lang="ts">
  import Choice from '@/components/tool/Choice.svelte';
  import Copy from '@/components/tool/Copy.svelte';
  import NumberField from '@/components/tool/NumberField.svelte';
  import Select from '@/components/tool/Select.svelte';
  import { setQuery } from '@/lib/client/harness';
  import { RATIOS, scaleCss, scaleOf, type RatioName } from '@duskresearch/primitives/design/type';
  import FontField from '../FontField.svelte';
  import { familyFor, type Font } from '../fonts';
  import { serializeWith, type TypeState } from '../state';

  // seed: the chosen face, from the page, so its file loads without the full list.
  let { initial, own, seed }: { initial: TypeState; own: ScaleOwn; seed?: Font } = $props();
  // svelte-ignore state_referenced_locally
  let t = $state<TypeState>({ ...initial });
  // svelte-ignore state_referenced_locally
  let s = $state<ScaleOwn>({ ...own });

  type Named = RatioName | 'custom';
  const ratioOptions = [...(Object.keys(RATIOS) as RatioName[]), 'custom'] as const;
  const ratioNames: Record<Named, string> = {
    'minor-second': 'Minor second, 1.067',
    'major-second': 'Major second, 1.125',
    'minor-third': 'Minor third, 1.2',
    'major-third': 'Major third, 1.25',
    'perfect-fourth': 'Perfect fourth, 1.333',
    'augmented-fourth': 'Augmented fourth, 1.414',
    'perfect-fifth': 'Perfect fifth, 1.5',
    golden: 'Golden ratio, 1.618',
    custom: 'Custom',
  };
  const nameOf = (r: number): Named => (Object.keys(RATIOS) as RatioName[]).find((k) => RATIOS[k] === r) ?? 'custom';
  let ratioName = $state<Named>(nameOf(initial.ratio));
  let minRatioName = $state<Named>(nameOf(own.minratio));
  $effect(() => {
    if (ratioName !== 'custom') t.ratio = RATIOS[ratioName];
  });
  $effect(() => {
    if (minRatioName !== 'custom') s.minratio = RATIOS[minRatioName];
  });

  let mode = $state<'fixed' | 'fluid'>(own.fluid ? 'fluid' : 'fixed');
  $effect(() => void (s.fluid = mode === 'fluid'));

  const steps = $derived([...scaleOf(t.base, t.ratio)].reverse());
  const css = $derived(scaleCss(t.base, t.ratio, s.fluid ? { minViewport: s.minw, maxViewport: s.maxw, minBase: s.minbase, minRatio: s.minratio } : undefined));

  let family = $state('var(--font-hanken), sans-serif');
  $effect(() => void familyFor(t.font, seed).then((f) => (family = f)));

  let loaded = false;
  $effect(() => {
    const query = serializeWith(t, { fluid: s.fluid ? 1 : 0, minw: s.minw, maxw: s.maxw, minbase: s.minbase, minratio: s.minratio });
    if (loaded) setQuery(query);
    loaded = true;
  });
</script>

<div class="surface">
  <ol class="steps">
    {#each steps as step (step.name)}
      <li>
        <Copy value={`${step.rem}rem`} label="rem" class="meta mono">
          <span>{step.name}</span><span>{step.px}px · {step.rem}rem · {step.leading}</span>
        </Copy>
        <p class="line" style:font-family={family} style:font-size={`${step.px}px`} style:line-height={step.leading}>{t.text}</p>
      </li>
    {/each}
  </ol>
</div>

<div class="panel">
  <FontField bind:font={t.font} known={seed} />
  <div class="group">
    <NumberField label="Base" name="Base size in px" value={t.base} min={8} max={40} places={2} onchange={(n) => (t.base = n)} />
    <div class="line">
      <span class="mono key">Ratio</span>
      <Select bind:value={ratioName} options={ratioOptions} names={ratioNames} label="Ratio" />
    </div>
    {#if ratioName === 'custom'}
      <NumberField label="×" name="Custom ratio" value={t.ratio} min={1.01} max={2} places={3} onchange={(n) => (t.ratio = n)} />
    {/if}
  </div>
  <div class="group">
    <Choice label="Sizes" options={['fixed', 'fluid'] as const} names={{ fixed: 'Fixed', fluid: 'Fluid' }} bind:value={mode} />
    {#if s.fluid}
      <p class="mono note">From a small scale on narrow screens to this one on wide screens.</p>
      <div class="pair">
        <NumberField label="From" name="Narrow screen width in px" value={s.minw} min={200} max={s.maxw - 1} onchange={(n) => (s.minw = n)} />
        <NumberField label="To" name="Wide screen width in px" value={s.maxw} min={s.minw + 1} max={3000} onchange={(n) => (s.maxw = n)} />
      </div>
      <NumberField label="Narrow base" name="Base size on narrow screens in px" value={s.minbase} min={8} max={40} places={2} onchange={(n) => (s.minbase = n)} />
      <div class="line">
        <span class="mono key">Narrow ratio</span>
        <Select bind:value={minRatioName} options={ratioOptions} names={ratioNames} label="Ratio on narrow screens" />
      </div>
    {/if}
  </div>
  <div class="block end">
    <p>CSS</p>
    <Copy value={css} label="CSS" primary class="code">{css}</Copy>
  </div>
</div>

<style>
  .surface {
    justify-content: flex-start;
    background: var(--paper-2);
    border: 1px solid var(--line-2);
    overflow: hidden;
  }
  .steps {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .steps li {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .steps :global(.meta) {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: var(--ink-2);
  }
  .line {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--ink);
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .line,
  .pair {
    min-width: 0;
  }
  .group .line {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    white-space: normal;
  }
  .key,
  .note {
    font-size: 11px;
    color: var(--ink-2);
  }
  .pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .end {
    margin-top: auto;
  }
</style>
