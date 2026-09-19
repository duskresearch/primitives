// Site-wide behavior, bound once. Astro runs bundled module scripts a single time even
// with client-side navigation, so everything here uses document-level delegation.
import { navigate } from 'astro:transitions/client';
import { motion } from '@/data/tokens.json';
import { copy } from './copy';
import { stamp, stampAbove } from './stamp';
import { say } from './status';
import { currentQuery, onPageLoad } from './harness';

const editable = (el: Element | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' ||
    (el.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'button', 'submit'].includes((el as HTMLInputElement).type)));

// Every value shown copies itself, and says so where it was clicked: a stamp at the pointer
// (above the value when the keyboard pressed it), or, for a button that names its action
// (data-copy-swap), its own label turning to "Copied" for a moment.
const swapped = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
function confirmCopy(el: HTMLElement, label: string, at?: MouseEvent) {
  if ('copySwap' in el.dataset) {
    if (!swapped.has(el)) el.dataset.label = el.textContent ?? '';
    clearTimeout(swapped.get(el));
    el.textContent = 'Copied';
    swapped.set(
      el,
      setTimeout(() => {
        el.textContent = el.dataset.label ?? '';
        swapped.delete(el);
      }, motion.toast.copied),
    );
  } else if (at && at.detail > 0) stamp(`Copied ${label}`, at.clientX, at.clientY);
  else stampAbove(`Copied ${label}`, el);
}

document.addEventListener('click', (e) => {
  const el = (e.target as Element).closest<HTMLElement>('[data-copy]');
  if (!el) return;
  e.preventDefault();
  const label = el.dataset.copyLabel ?? 'value';
  copy(el.dataset.copy!, label);
  confirmCopy(el, label, e);
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
    const label = primary.dataset.copyLabel ?? 'value';
    copy(primary.dataset.copy!, label);
    confirmCopy(primary, label);
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
    // The server words its own answers ("Already planned: Shadow, in Light.").
    const reply = (await res.json().catch(() => ({}))) as { message?: string };
    if (res.ok) form.reset();
    say(reply.message ?? (res.ok ? form.dataset.confirm : form.dataset.error) ?? '', motion.toast.confirm);
  } catch {
    say(form.dataset.error ?? '', motion.toast.confirm);
  }
});

// Inputs marked data-autosize grow with their text. CSS field-sizing does it where supported;
// elsewhere, measure the text (or the placeholder while empty) and set the width.
if (!CSS.supports('field-sizing', 'content')) {
  const ctx = document.createElement('canvas').getContext('2d')!;
  const fit = (input: HTMLInputElement) => {
    ctx.font = getComputedStyle(input).font;
    input.style.width = `${Math.ceil(ctx.measureText(input.value || input.placeholder).width) + 2}px`;
  };
  document.addEventListener('input', (e) => {
    if (e.target instanceof HTMLInputElement && 'autosize' in e.target.dataset) fit(e.target);
  });
  document.addEventListener('astro:page-load', () => document.querySelectorAll<HTMLInputElement>('input[data-autosize]').forEach(fit));
}

document.addEventListener('astro:page-load', onPageLoad);
