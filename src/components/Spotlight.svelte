<script lang="ts">
  // Spotlight: find anything on the site (instruments, primitives, pages). Opens from
  // ⌘K / Ctrl+K anywhere, `/` when no input is focused, or the landing search field.
  // Persisted across navigations.
  import { onMount, tick } from 'svelte';
  import { navigate } from 'astro:transitions/client';
  import { search, type SearchItem } from '@/lib/search';
  import { stateHref } from '@/lib/client/harness';

  let { items }: { items: SearchItem[] } = $props();

  let open = $state(false);
  let q = $state('');
  let sel = $state(0);
  let input: HTMLInputElement | undefined = $state();
  let list: HTMLElement | undefined = $state();
  let mac = $state(true);
  let returnTo: HTMLElement | null = null;
  let ignoreTriggerFocus = false;

  const results = $derived(search(items, q));
  const hits = $derived(results.hits);
  const groups = $derived(results.groups);

  async function show(initial = '') {
    if (open) return;
    returnTo = document.activeElement as HTMLElement | null;
    q = initial;
    sel = 0;
    open = true;
    await tick();
    input?.focus();
  }

  function hide(restoreFocus = true) {
    if (!open) return;
    open = false;
    q = '';
    sel = 0;
    if (restoreFocus && returnTo?.isConnected) {
      // Returning focus to the landing field must not reopen the panel.
      ignoreTriggerFocus = returnTo.matches('[data-spotlight-trigger]');
      returnTo.focus();
    }
    returnTo = null;
  }

  function go(index: number) {
    const item = hits[index];
    if (!item) return;
    hide(false);
    navigate(stateHref(item.href));
  }

  function onInputKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      sel = Math.min(sel + 1, hits.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      sel = Math.max(sel - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(sel);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      hide();
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  }

  const editable = (el: Element | null) =>
    el instanceof HTMLElement &&
    (el.isContentEditable || ['TEXTAREA', 'SELECT'].includes(el.tagName) ||
      (el.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'button', 'submit'].includes((el as HTMLInputElement).type)));

  function onWindowKey(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open ? hide() : show();
    } else if (e.key === '/' && !open && !e.metaKey && !e.ctrlKey && !e.altKey && !editable(document.activeElement)) {
      e.preventDefault();
      show();
    } else if (e.key === 'Escape' && open) {
      hide();
    }
  }

  // Landing page: the search field opens the panel and mirrors its query; tiles of
  // primitives with no match fade while a query is typed.
  function onTriggerFocus(e: FocusEvent) {
    if (ignoreTriggerFocus) {
      ignoreTriggerFocus = false;
      return;
    }
    show((e.currentTarget as HTMLInputElement).value);
  }

  function bindPage() {
    document.querySelectorAll<HTMLInputElement>('[data-spotlight-trigger]').forEach((el) => {
      el.removeEventListener('focus', onTriggerFocus);
      el.addEventListener('focus', onTriggerFocus);
    });
    syncPage();
  }

  function syncPage() {
    const term = open ? q.trim() : '';
    const matched = new Set(hits.map((h) => h.primitive).filter(Boolean));
    document.querySelectorAll<HTMLInputElement>('[data-spotlight-trigger]').forEach((el) => (el.value = open ? q : ''));
    document.querySelectorAll<HTMLElement>('[data-tile]').forEach((tile) => {
      tile.classList.toggle('dim', Boolean(term) && !matched.has(tile.dataset.tile!));
    });
  }

  $effect(() => {
    void [open, q, hits];
    syncPage();
  });

  $effect(() => {
    if (!open) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => (root.style.overflow = before);
  });

  $effect(() => {
    if (open) list?.querySelector(`#spot-${sel}`)?.scrollIntoView({ block: 'nearest' });
  });

  onMount(() => {
    mac = /mac|iphone|ipad/i.test(navigator.userAgent);
    const close = () => hide(false);
    bindPage();
    document.addEventListener('astro:page-load', bindPage);
    document.addEventListener('astro:before-preparation', close);
    return () => {
      document.removeEventListener('astro:page-load', bindPage);
      document.removeEventListener('astro:before-preparation', close);
    };
  });
</script>

<svelte:window onkeydown={onWindowKey} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="scrim" role="presentation" onclick={(e) => e.target === e.currentTarget && hide()}>
    <div class="panel" role="dialog" aria-modal="true" aria-label="Find an instrument">
      <div class="head">
        <input
          bind:this={input}
          bind:value={q}
          oninput={() => (sel = 0)}
          onkeydown={onInputKey}
          placeholder="Find an instrument"
          role="combobox"
          aria-expanded="true"
          aria-controls="spotlight-results"
          aria-autocomplete="list"
          aria-activedescendant={hits[sel] ? `spot-${sel}` : undefined}
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        />
        <span class="count mono" aria-live="polite">{hits.length} {hits.length === 1 ? 'result' : 'results'}</span>
        <button type="button" class="badge" tabindex="-1" onclick={() => hide()}>esc</button>
      </div>
      <div class="results" id="spotlight-results" role="listbox" aria-label="Results" bind:this={list}>
        {#each groups as group, g (group.label)}
          <div role="group" aria-labelledby={`spot-group-${g}`}>
            <div class="group t-mono-label" id={`spot-group-${g}`}>{group.label}</div>
            {#each group.rows as { item, index } (`${item.kind}:${item.group}:${item.name}`)}
              <a
                id={`spot-${index}`}
                href={item.href}
                role="option"
                aria-selected={index === sel}
                tabindex="-1"
                class:on={index === sel}
                class:muted={item.muted}
                onmousemove={() => (sel = index)}
                onclick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  go(index);
                }}
              >
                <span class="name">{item.name}</span>
                <span class="does">{item.does}</span>
                <span class="slug mono">{item.address}</span>
              </a>
            {/each}
          </div>
        {/each}
        {#if !hits.length}
          <p class="none">Nothing for “{q.trim()}” yet.</p>
        {/if}
      </div>
      <div class="foot mono">
        <span>↑↓ move · ↵ open</span>
        <span>{mac ? '⌘K' : 'Ctrl K'} anywhere</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: var(--spotlight-top);
    background: var(--scrim);
  }
  .panel {
    width: var(--spotlight-width);
    max-width: calc(100% - 40px);
    max-height: min(var(--spotlight-max-height), calc(100dvh - var(--spotlight-top) - 20px));
    display: flex;
    flex-direction: column;
    background: var(--paper-2);
    border: 1px solid var(--line-1);
    box-shadow: var(--shadow-spotlight);
  }
  .head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--ink);
  }
  input {
    flex: 1;
    min-width: 0;
    border: 0;
    padding: 0;
    background: transparent;
    font: 400 18px/1.3 var(--sans);
    color: var(--ink);
  }
  /* The panel's ink rule is the field's focus indicator: it is the only field and always focused. */
  input:focus {
    outline: none;
  }
  .count,
  .slug,
  .foot {
    font-size: 11px;
    color: var(--ink-2);
  }
  .badge {
    background: transparent;
  }
  .results {
    overflow: auto;
    overscroll-behavior: contain;
    padding: 8px 0 12px;
  }
  .group {
    padding: 12px 20px 4px;
    color: var(--ink-2);
  }
  a {
    display: grid;
    grid-template-columns: 120px 1fr auto;
    gap: 16px;
    align-items: baseline;
    padding: 10px 20px;
  }
  a.on {
    background: var(--paper);
  }
  .name {
    font-size: 17px;
    letter-spacing: -0.01em;
  }
  .muted .name {
    color: var(--ink-2);
  }
  .does {
    font-size: 14px;
    line-height: 1.35;
    color: var(--ink-2);
  }
  .none {
    padding: 12px 20px;
    font-size: 14px;
    color: var(--ink-2);
  }
  .foot {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    border-top: 1px solid var(--line-2);
  }
  @media (pointer: coarse) {
    .foot {
      display: none;
    }
  }
  @media (max-width: 719px) {
    .scrim {
      --spotlight-top: 64px;
    }
    a {
      grid-template-columns: 1fr auto;
      row-gap: 2px;
    }
    .does {
      grid-column: 1 / -1;
      grid-row: 2;
    }
  }
</style>
