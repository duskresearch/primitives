// The email line: one row per address in D1, as the other Dusk projects keep their lists.
import type { APIRoute } from 'astro';
import { bindings } from '#runtime-bindings';
import { site } from '@/lib/catalogue';
import { answer, readBody } from '@/lib/server/body';
import { allow, requireDb, sameOrigin, visitor } from '@/lib/server/visitor';

export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const POST: APIRoute = async ({ request, locals }) => {
  const { data, json } = await readBody(request);
  const respond = (body: Record<string, unknown>, status: number) => answer(request, json, body, status);
  let binding;
  try { binding = bindings(locals, request); }
  catch { return new Response(json ? JSON.stringify({ ok: false, message: 'Requests are temporarily unavailable.' }) : 'Requests are temporarily unavailable.', { status: 503, headers: { 'content-type': json ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', 'cache-control': 'no-store' } }); }
  if (!sameOrigin(request)) return respond({ ok: false, message: site.errorLine }, 403);
  const email = String(data.email ?? '').trim().toLowerCase();
  if (data.website) return respond({ ok: true, message: site.emailConfirm }, 200);
  if (email.length > 254 || !EMAIL.test(email)) return respond({ ok: false, message: 'That address does not look right.' }, 422);
  const db = requireDb(binding.db);
  const who = await visitor(request, binding);
  if (!(await allow(db, `subscribe:${who.network}`, 5, 60))) return respond({ ok: false, message: 'That is a lot at once. Try again in a minute.' }, 429);
  const country = (request as Request & { cf?: { country?: string } }).cf?.country ?? null;
  await db
    .prepare('INSERT OR IGNORE INTO subscribers (email, created_at, page, country) VALUES (?1, unixepoch(), ?2, ?3)')
    .bind(email, String(data.page ?? '').slice(0, 100) || null, country)
    .run();
  return respond({ ok: true, message: site.emailConfirm }, 200);
};
