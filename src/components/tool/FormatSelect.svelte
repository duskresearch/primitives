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
    background:
      linear-gradient(45deg, transparent 50%, currentColor 50%) no-repeat calc(100% - 4px) 55% / 4px 4px,
      linear-gradient(135deg, currentColor 50%, transparent 50%) no-repeat 100% 55% / 4px 4px;
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
