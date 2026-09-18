<script lang="ts" generics="T extends string">
  // One of a few settings, as a row of words. Native radios underneath, so arrow keys move
  // the choice and screen readers announce a group.
  let { label, options, names, value = $bindable() }: {
    /** Names the group; also the radios' shared name, so it must be unique on the page. */
    label: string;
    options: readonly T[];
    /** The word shown for each option. */
    names: Record<T, string>;
    value: T;
  } = $props();
</script>

<fieldset class="choice">
  <legend class="mono">{label}</legend>
  <div class="options">
    {#each options as option (option)}
      <label class:on={value === option}>
        <input type="radio" name={label} value={option} checked={value === option} onchange={() => (value = option)} />
        <span>{names[option]}</span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  .choice {
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }
  legend {
    margin-bottom: 8px;
    padding: 0;
    font-size: 11px;
    color: var(--ink-2);
  }
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
  }
  label {
    position: relative;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--ink-2);
    cursor: pointer;
    transition: color var(--dur-color);
  }
  label:hover,
  label.on {
    color: var(--ink);
  }
  input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }
  label:has(input:focus-visible) {
    outline: var(--focus);
    outline-offset: var(--focus-offset);
  }
  @media (pointer: coarse) {
    label {
      display: inline-flex;
      align-items: center;
      min-height: var(--min-hit);
    }
  }
</style>
