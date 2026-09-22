import { primitives, site } from './request-catalogue';
import { moderate } from '../moderation';
import { findInCatalogue, normalize, sameIdea } from '../requests';
import { board, idea, insert, log, names, vote } from './ideas';
import { allow, requireDb, visitor } from './visitor';

export type Operation = 'board' | 'row' | 'request' | 'vote' | 'subscribe';
export type Binding = { db?: D1Database; salt?: string; ip?: string | null };
export type Result = { status: number; data: Record<string, unknown> };
const result = (status: number, data: Record<string, unknown>): Result => ({ status, data });
const limited = () => result(429, { ok: false, message: 'That is a lot at once. Try again in a minute.' });

/** All database and visitor operations live on Cloudflare for both site targets. */
export async function operate(op: Operation, request: Request, binding: Binding, input: Record<string, unknown>, development = false): Promise<Result> {
  const db = requireDb(binding.db);
  const who = await visitor(request, binding, development);
  if (op === 'board') {
    const value = await board(db, who.voter);
    return result(200, { ideas: value.ideas, voted: [...value.voted] });
  }
  if (op === 'row') {
    const id = typeof input.id === 'string' ? input.id : '';
    if (!/^[a-zA-Z0-9_-]{1,40}$/.test(id)) return result(404, { ok: false });
    const found = await idea(db, id, who.voter);
    return found ? result(200, { idea: found.idea, voted: found.voted }) : result(404, { ok: false });
  }
  if (op === 'vote') {
    const id = typeof input.id === 'string' ? input.id.slice(0, 40) : '';
    if (!(await allow(db, `vote:${who.network}`, 60, 60))) return limited();
    const live = await db.prepare("SELECT 1 FROM suggestions WHERE id = ?1 AND status = 'live'").bind(id).first();
    if (!live) return result(404, { ok: false, message: site.errorLine });
    return result(200, { ok: true, ...await vote(db, id, who.voter, typeof input.on === 'boolean' ? input.on : undefined) });
  }
  if (op === 'subscribe') {
    const email = String(input.email ?? '').trim().toLowerCase();
    if (input.website) return result(200, { ok: true, message: site.emailConfirm });
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return result(422, { ok: false, message: 'That address does not look right.' });
    if (!(await allow(db, `subscribe:${who.network}`, 5, 60))) return limited();
    const country = (request as Request & { cf?: { country?: string } }).cf?.country ?? null;
    await db.prepare('INSERT OR IGNORE INTO subscribers (email, created_at, page, country) VALUES (?1, unixepoch(), ?2, ?3)')
      .bind(email, String(input.page ?? '').slice(0, 100) || null, country).run();
    return result(200, { ok: true, message: site.emailConfirm });
  }
  const text = String(input.text ?? '');
  const detail = String(input.detail ?? '');
  const primitive = primitives.some((p) => p.slug === input.primitive) ? String(input.primitive) : null;
  const page = String(input.page ?? '').slice(0, 100) || null;
  if (input.website) return result(201, { ok: true, outcome: 'new', message: 'Added to the list.' });
  if (!(await allow(db, `suggest:${who.network}`, 5, 60)) || !(await allow(db, `suggest-day:${who.network}`, 30, 86400))) return result(429, { ok: false, outcome: 'limited', message: 'That is a lot at once. Try again in a minute.' });
  const entry = { text, detail, primitive, page, author: who.network };
  const verdict = moderate({ name: text, detail });
  if (verdict.outcome === 'refuse') {
    await log(db, { ...entry, outcome: 'refused', reason: verdict.reason });
    return result(422, { ok: false, outcome: 'refused', message: 'That does not look like a primitive or an instrument. Try a word or two, like Sound.' });
  }
  const known = findInCatalogue(verdict.name, primitive);
  if (known) {
    await log(db, { ...entry, outcome: known.kind });
    const where = known.name === known.primitive ? '' : `, in ${known.primitive}`;
    return result(200, { ok: true, outcome: known.kind, message: known.kind === 'live' ? `${known.name} is already live${where}.` : `Already planned: ${known.name}${where}.`, href: known.href });
  }
  const key = normalize(verdict.name);
  const repeat = (await names(db)).find((r) => sameIdea(r.normalized, key) && (!r.primitive || !primitive || r.primitive === primitive));
  if (repeat) {
    await log(db, { ...entry, outcome: 'repeat', suggestionId: repeat.id });
    if (repeat.status !== 'live') return result(200, { ok: true, outcome: 'held', message: 'Thanks. We will read it before it goes on the list.' });
    const { votes } = await vote(db, repeat.id, who.voter, true);
    return result(200, { ok: true, outcome: 'repeat', id: repeat.id, votes, message: `Already on the list: ${repeat.name}. Your vote is counted.` });
  }
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 10);
  const status = verdict.outcome === 'accept' ? 'live' : 'held';
  await insert(db, { id, name: verdict.name, detail: verdict.detail, primitive, normalized: key, status, reason: verdict.reason, source: page ?? 'unknown', author: who.network });
  await log(db, { ...entry, outcome: status === 'live' ? 'new' : 'held', reason: verdict.reason, suggestionId: id });
  return status === 'live' ? result(201, { ok: true, outcome: 'new', id, message: 'Added to the list.' }) : result(201, { ok: true, outcome: 'held', message: 'Thanks. We will read it before it goes on the list.' });
}
