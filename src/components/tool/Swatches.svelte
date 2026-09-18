<script lang="ts" module>
  export interface Swatch {
    key: string;
    /** Above the hex: the step name, the hue offset. */
    name: string;
    hex: string;
    /** A short word after the name, e.g. "base". */
    note?: string;
  }
</script>

<script lang="ts">
  // Colors side by side, each filling its share of the surface and copying its hex when
  // clicked. Like paint chips, the label sits on paper under the color, so it reads for any
  // color at all. Columns on wide screens, rows on phones.
  let { items }: { items: Swatch[] } = $props();
</script>

<div class="swatches">
  {#each items as s (s.key)}
    <button type="button" class="swatch" data-copy={s.hex} data-copy-label="hex">
      <span class="visually-hidden">Copy </span>
      <span class="chip" style:background-color={s.hex}></span>
      <span class="label mono">
        <span class="name">{s.note ? `${s.name} · ${s.note}` : s.name}</span>
        <span class="hex">{s.hex}</span>
      </span>
    </button>
  {/each}
</div>

<style>
  .swatches {
    flex: 1;
    display: flex;
    min-height: 0;
  }
  .swatch {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 0;
    border: 0;
    background: var(--paper-2);
    text-align: left;
    cursor: copy;
  }
  /* A ring that shows on any color: ink outside, paper inside. */
  .swatch:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: -2px;
    box-shadow: inset 0 0 0 4px var(--paper);
  }
  .chip {
    flex: 1;
    min-height: 0;
    transition: background-color var(--dur-color);
  }
  .label {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 14px;
    font-size: 11px;
    color: var(--ink);
  }
  .name {
    color: var(--ink-2);
  }
  .hex {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @media (max-width: 639px) {
    .swatches {
      flex-direction: column;
    }
    .swatch {
      flex-direction: row;
      min-height: var(--min-hit);
    }
    .label {
      flex: 0 0 55%;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
