// Site-wide behavior, bound once. Astro runs bundled module scripts a single time even
// with client-side navigation, so everything here uses document-level delegation.
import { navigate } from 'astro:transitions/client';
import { motion } from '@/data/tokens.json';
import { copy } from './copy';
import { say } from './status';
import { currentQuery, onPageLoad } from './harness';

const editable = (el: Element | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' ||
    (el.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'button', 'submit'].includes((el as HTMLInputElement).type)));

// Every value shown copies itself.
document.addEventListener('click', (e) => {
  const el = (e.target as Element).closest<HTMLElement>('[data-copy]');
  if (!el) return;
  e.preventDefault();
  copy(el.dataset.copy!, el.dataset.copyLabel ?? 'value');
});

// Keys: [ ] step through a primitive's instruments, C copies the primary value.
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || editable(document.activeElement)) return;
  const main = document.querySelector<HTMLElement>('[data-primitive]');
  if (!main) return;
  if (e.key === '[' || e.key === ']') {
    const href = e.key === '[' ? main.dataset.prev : main.dataset.next;
    if (!href) return;
    e.preventDefault();
    const q = currentQuery();
    navigate(q ? `${href}?${q}` : href);
  } else if (e.key === 'c' || e.key === 'C') {
    const primary = document.querySelector<HTMLElement>('[data-primary]');
    if (!primary) return;
    e.preventDefault();
    copy(primary.dataset.copy!, primary.dataset.copyLabel ?? 'value');
  }
});

// Request and subscribe forms post to the Worker; results land in the status slot.
// The forms carry data-astro-reload so the client router leaves them to this handler.
document.addEventListener('submit', async (e) => {
  const form = e.target as HTMLFormElement;
  if (!('form' in form.dataset)) return;
  e.preventDefault();
  const endpoint = form.getAttribute('action')!;
  const body = Object.fromEntries(new FormData(form));
  const field = form.querySelector<HTMLInputElement>('input:not([tabindex="-1"])');
  if (!field?.value.trim()) return field?.focus();
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...body, page: location.pathname }),
    });
    if (!res.ok) throw new Error(String(res.status));
    form.reset();
    say(form.dataset.confirm ?? '', motion.toast.confirm);
  } catch {
    say(form.dataset.error ?? '', motion.toast.confirm);
  }
});

document.addEventListener('astro:page-load', onPageLoad);
