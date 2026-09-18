<script lang="ts">
  // Which format a color is written in, as a small dropdown: the way design tools offer it.
  import { CSS_FORMATS, type CssFormat } from '@duskresearch/primitives/design/color';

  let { format = $bindable(), label }: { format: CssFormat; label: string } = $props();
  const names: Record<CssFormat, string> = { hex: 'Hex', rgb: 'RGB', hsl: 'HSL', oklch: 'OKLCH' };
</script>

<select class="format mono" aria-label={label} bind:value={format}>
  {#each CSS_FORMATS as f (f)}
    <option value={f}>{names[f]}</option>
  {/each}
</select>

<style>
  .format {
    field-sizing: content;
    appearance: none;
    margin: 0;
    padding: 5px 14px 5px 0;
    border: 0;
    border-radius: 0;
    background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0h8L4 5z' fill='%236b6a63'/%3E%3C/svg%3E") no-repeat right center;
    font-family: var(--mono);
    font-size: 11px;
    line-height: 1.25;
    color: var(--ink-2);
    cursor: pointer;
  }
  .format:hover {
    color: var(--ink);
  }
  @media (pointer: coarse) {
    .format {
      min-height: var(--min-hit);
    }
  }
</style>
