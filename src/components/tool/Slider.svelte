<script lang="ts">
  // Native range input with a label and a readout that copies itself.
  // Arrows step; Shift+arrow steps ×10.
  // The value is written one way: a range input snaps to its step grid, and reading that
  // back on load would move a color that arrived in the URL.
  import Copy from './Copy.svelte';

  let { label, group, value = $bindable(), min, max, step, format }: {
    label: string;
    /** Names the control for assistive tech, e.g. "Text" → "Text L". */
    group: string;
    value: number;
    min: number;
    max: number;
    step: number;
    format: (v: number) => string;
  } = $props();

  const places = (String(step).split('.')[1] ?? '').length;

  function onkeydown(e: KeyboardEvent) {
    if (!e.shiftKey) return;
    const dir = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    value = Number(Math.min(max, Math.max(min, value + dir * step * 10)).toFixed(places));
  }
</script>

<div class="slider">
  <span class="label" aria-hidden="true">{label}</span>
  <input
    type="range"
    {min}
    {max}
    {step}
    {value}
    oninput={(e) => (value = Number(e.currentTarget.value))}
    {onkeydown}
    aria-label={`${group} ${label}`}
    aria-valuetext={format(value)}
  />
  <Copy value={format(value)} label={`${group.toLowerCase()} ${label}`} class="value">{format(value)}</Copy>
</div>

<style>
  .slider {
    display: grid;
    grid-template-columns: 18px 1fr 48px;
    gap: 10px;
    align-items: center;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--ink-2);
  }
  input {
    width: 100%;
  }
  .slider :global(.value) {
    justify-content: flex-end;
    text-align: right;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
  }
  /* Touch: a 44px hit area around a drawn-small track. */
  @media (pointer: coarse) {
    input {
      height: var(--min-hit);
    }
  }
</style>
