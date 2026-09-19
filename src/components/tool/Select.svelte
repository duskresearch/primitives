<script lang="ts" generics="T extends string">
  // A small dropdown in the panel's mono type, for a setting with a handful of values.
  let { value = $bindable(), options, names, label }: { value: T; options: readonly T[]; names: Record<T, string>; label: string } = $props();
</script>

<select class="select mono" aria-label={label} bind:value>
  {#each options as o (o)}
    <option value={o}>{names[o]}</option>
  {/each}
</select>

<style>
  .select {
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
    color: var(--ink);
    cursor: pointer;
  }
  @media (pointer: coarse) {
    .select {
      min-height: var(--min-hit);
    }
  }
</style>
