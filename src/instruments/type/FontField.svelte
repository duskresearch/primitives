<script lang="ts">
  // Any Google Fonts family, by name. The list of 1,946 loads the first time the field is
  // used, so pages that never change the face never fetch it.
  import { loadFonts, type Font } from './fonts';

  let { font = $bindable(), label = 'Font', known }: { font: string; label?: string; known?: Font } = $props();

  let fonts = $state<Font[]>([]);
  let draft = $state<string | null>(null);
  let invalid = $state(false);
  const id = `font-${label.toLowerCase().replace(/\W+/g, '-')}`;

  // The family name for the id in the URL; until the list arrives, a readable form of the id.
  const named = $derived((known?.id === font ? known : fonts.find((f) => f.id === font))?.family ?? font.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));

  $effect(() => {
    // The name shown is the real family name as soon as the list is there.
    if (fonts.length === 0 && font !== 'hanken-grotesk' && font !== known?.id) loadFonts().then((d) => (fonts = d.fonts));
  });

  // A name typed (or pasted, and the field left) before the list arrives is checked again
  // once it does.
  let left = false;
  function done() {
    draft = null;
    invalid = false;
    left = false;
  }
  function check() {
    if (draft === null || !fonts.length) return;
    const match = fonts.find((f) => f.family.toLowerCase() === draft!.trim().toLowerCase());
    invalid = !match && draft.trim() !== '';
    if (match) font = match.id;
  }
</script>

<label class="font-field mono" for={id}>
  <span>{label}</span>
  <input
    {id}
    class="field"
    class:invalid
    type="text"
    list={`${id}-list`}
    value={draft ?? named}
    onfocus={(e) => {
      left = false;
      if (!fonts.length) loadFonts().then((d) => ((fonts = d.fonts), check(), left && done()));
      draft = named;
      e.currentTarget.select();
    }}
    oninput={(e) => ((draft = e.currentTarget.value), check())}
    onblur={() => (fonts.length ? done() : (left = true))}
    onkeydown={(e) => (e.key === 'Enter' || e.key === 'Escape') && e.currentTarget.blur()}
    autocomplete="off"
    spellcheck="false"
    aria-invalid={invalid}
  />
  <datalist id={`${id}-list`}>
    {#each fonts as f (f.id)}
      <option value={f.family}></option>
    {/each}
  </datalist>
</label>

<style>
  .font-field {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    font-size: 11px;
    color: var(--ink-2);
  }
  .field {
    flex: 1;
    max-width: 70%;
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
