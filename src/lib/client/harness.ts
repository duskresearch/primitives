// URL state for instrument pages. The URL is the only state: tools report their
// serialized query here, and the harness mirrors it into the address bar (debounced),
// the canonical URL shown in the header, and links to sibling instruments.
import { motion } from '@/data/tokens.json';

let query = '';
let timer: ReturnType<typeof setTimeout> | undefined;

const withQuery = (href: string) => {
  const url = new URL(href, location.origin);
  url.search = query;
  return url.pathname + url.search;
};

export const currentQuery = () => query;

/** Carry the current state onto an in-primitive link, e.g. from the spotlight. */
export function stateHref(href: string) {
  const here = document.querySelector<HTMLElement>('[data-primitive]')?.dataset.primitive;
  return here && query && href.startsWith(`/${here}/`) ? withQuery(href) : href;
}

function apply() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-state-link]').forEach((a) => {
    a.href = withQuery(a.getAttribute('href')!);
  });
  const shown = document.querySelector<HTMLElement>('[data-canonical]');
  if (shown) {
    const address = `${shown.dataset.base}${query ? `?${query}` : ''}`;
    shown.textContent = address;
    shown.dataset.copy = `https://${address}`;
  }
}

export function setQuery(next: string) {
  if (next === query) return;
  query = next;
  apply();
  clearTimeout(timer);
  timer = setTimeout(() => {
    // Keep Astro's router state in history.state; only the URL changes.
    history.replaceState(history.state, '', `${location.pathname}${query ? `?${query}` : ''}`);
  }, motion.urlDebounce);
}

/**
 * On every page load, adopt the state the server parsed from the URL. The server's
 * version is normalized (junk dropped, short hex expanded, other params ignored), so
 * links and the copied address never carry what was typed into the address bar.
 */
export function onPageLoad() {
  clearTimeout(timer);
  const shown = document.querySelector<HTMLElement>('[data-canonical]');
  query = shown && location.search ? (shown.dataset.query ?? '') : '';
  if (query) apply();
}
