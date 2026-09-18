<script lang="ts">
  // A value that copies itself. The click is handled site-wide (src/lib/client/global.ts);
  // `primary` marks the value the `C` key copies.
  import type { Snippet } from 'svelte';

  let { value, label, primary = false, class: className = '', children }: {
    value: string;
    label: string;
    primary?: boolean;
    class?: string;
    children: Snippet;
  } = $props();
</script>

<button
  type="button"
  class="copy {className}"
  data-copy={value}
  data-copy-label={label}
  data-primary={primary ? '' : undefined}><span class="visually-hidden">Copy </span>{@render children()}</button>
