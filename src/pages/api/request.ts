// A suggestion from any request form: the landing tile, a primitive's "Want this sooner?"
// line, or /requests. Filtered, checked against the catalogue and the board, then stored.
import type { APIRoute } from 'astro';
import { bindings } from '#runtime-bindings';
import { primitives, site } from '@/lib/catalogue';
import { moderate } from '@/lib/moderation';
import { findInCatalogue, normalize, sameIdea } from '@/lib/requests';
import { answer, readBody } from '@/lib/server/body';
import { insert, log, names, vote } from '@/lib/server/ideas';
import { allow, requireDb, sameOrigin, visitor } from '@/lib/server/visitor';

export const prerender = false;

const messages = {
  added: 'Added to the list.',
  held: 'Thanks. We will read it before it goes on the list.',
  refused: 'That does not look like a primitive or an instrument. Try a word or two, like Sound.',
  limited: 'That is a lot at once. Try again in a minute.',
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { data, json } = await readBody(request);
  const respond = (body: Record<string, unknown>, status: number) => answer(request, json, body, status);
  let binding;
  try { binding = bindings(locals, request); }
  catch { return new Response(json ? JSON.stringify({ ok: false, message: 'Requests are temporarily unavailable.' }) : 'Requests are temporarily unavailable.', { status: 503, headers: { 'content-type': json ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', 'cache-control': 'no-store' } }); }
  if (!sameOrigin(request)) return respond({ ok: false, message: site.errorLine }, 403);

  const text = String(data.text ?? '');
  const detail = String(data.detail ?? '');
  const primitive = primitives.some((p) => p.slug === data.primitive) ? String(data.primitive) : null;
  const page = String(data.page ?? '').slice(0, 100) || null;
  // Honeypot: people never fill the hidden field. Pretend it worked.
  if (data.website) return respond({ ok: true, outcome: 'new', message: messages.added }, 201);

  const db = requireDb(binding.db);
  const who = await visitor(request, binding);
  if (!(await allow(db, `suggest:${who.network}`, 5, 60)) || !(await allow(db, `suggest-day:${who.network}`, 30, 86400)))
    return respond({ ok: false, outcome: 'limited', message: messages.limited }, 429);
  const entry = { text, detail, primitive, page, author: who.network };

  const verdict = moderate({ name: text, detail });
  if (verdict.outcome === 'refuse') {
    await log(db, { ...entry, outcome: 'refused', reason: verdict.reason });
    return respond({ ok: false, outcome: 'refused', message: messages.refused }, 422);
  }

  const known = findInCatalogue(verdict.name, primitive);
  if (known) {
    await log(db, { ...entry, outcome: known.kind });
    const where = known.name === known.primitive ? '' : `, in ${known.primitive}`;
    const message = known.kind === 'live' ? `${known.name} is already live${where}.` : `Already planned: ${known.name}${where}.`;
    return respond({ ok: true, outcome: known.kind, message, href: known.href }, 200);
  }

  const key = normalize(verdict.name);
  const repeat = (await names(db)).find((r) => sameIdea(r.normalized, key) && (!r.primitive || !primitive || r.primitive === primitive));
  if (repeat) {
    await log(db, { ...entry, outcome: 'repeat', suggestionId: repeat.id });
    if (repeat.status !== 'live') return respond({ ok: true, outcome: 'held', message: messages.held }, 200);
    const { votes } = await vote(db, repeat.id, who.voter, true);
    return respond({ ok: true, outcome: 'repeat', id: repeat.id, votes, message: `Already on the list: ${repeat.name}. Your vote is counted.` }, 200);
  }

  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 10);
  const status = verdict.outcome === 'accept' ? 'live' : 'held';
  await insert(db, { id, name: verdict.name, detail: verdict.detail, primitive, normalized: key, status, reason: verdict.reason, source: page ?? 'unknown', author: who.network });
  await log(db, { ...entry, outcome: status === 'live' ? 'new' : 'held', reason: verdict.reason, suggestionId: id });
  return status === 'live'
    ? respond({ ok: true, outcome: 'new', id, message: messages.added }, 201)
    : respond({ ok: true, outcome: 'held', message: messages.held }, 201);
};
