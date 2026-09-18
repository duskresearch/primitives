<script lang="ts">
  // One channel of a color as a number box: a letter, then the value. Type a number, or use
  // the arrow keys (Shift for ten steps). Out-of-range input is marked and left alone.
  let { label, name, value, min, max, places = 0, onchange }: {
    /** The letter shown, e.g. "R". */
    label: string;
    /** The channel's name, for assistive tech, e.g. "Red". */
    name: string;
    value: number;
    min: number;
    max: number;
    /** Decimal places shown and stepped by. */
    places?: number;
    onchange: (value: number) => void;
  } = $props();

  let editing = $state(false);
  let draft = $state('');
  let invalid = $state(false);
  const text = (v: number) => String(Number(v.toFixed(places)));
  const shown = $derived(editing ? draft : text(value));
  const step = 10 ** -places;

  function accept(raw: string) {
    const n = Number(raw.trim().replace(',', '.').replace(/[%°]$/, ''));
    invalid = raw.trim() === '' || !Number.isFinite(n) || n < min || n > max;
    if (!invalid) onchange(n);
  }

  function onkeydown(e: KeyboardEvent & { currentTarget: HTMLInputElement }) {
    if (e.key === 'Enter' || e.key === 'Escape') return e.currentTarget.blur();
    const dir = { ArrowUp: 1, ArrowDown: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const next = Math.min(max, Math.max(min, Number((value + dir * step * (e.shiftKey ? 10 : 1)).toFixed(places))));
    draft = text(next);
    onchange(next);
  }
</script>

<label class="number mono">
  <span aria-hidden="true">{label}</span>
  <input
    class="field"
    class:invalid
    type="text"
    inputmode="decimal"
    value={shown}
    aria-label={name}
    aria-invalid={invalid}
    oninput={(e) => {
      draft = e.currentTarget.value;
      accept(draft);
    }}
    onfocus={(e) => {
      const field = e.currentTarget;
      draft = text(value);
      editing = true;
      requestAnimationFrame(() => field.select());
    }}
    onblur={() => ((editing = false), (invalid = false))}
    {onkeydown}
    autocomplete="off"
    spellcheck="false"
  />
</label>

<style>
  .number {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
    font-size: 11px;
    color: var(--ink-2);
  }
  .field {
    flex: 1;
    width: 100%;
    min-width: 0;
    padding: 5px 0;
    line-height: 1.25;
    border-bottom-color: var(--line-3);
    font-family: var(--mono);
    font-size: 11px;
    text-align: right;
    color: var(--ink);
  }
  .field:focus {
    border-bottom-color: var(--ink);
  }
  .field.invalid {
    border-bottom-color: var(--fail);
  }
  @media (pointer: coarse) {
    .field {
      min-height: 0;
    }
  }
</style>
