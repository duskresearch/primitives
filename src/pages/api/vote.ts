// Toggle a visitor's vote on a live idea. One vote per visitor per idea.
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { site } from '@/lib/catalogue';
import { vote } from '@/lib/server/ideas';
import { allow, reply, sameOrigin, visitor } from '@/lib/server/visitor';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return reply({ ok: false, message: site.errorLine }, 403);
  const body = (await request.json().catch(() => ({}))) as { id?: unknown; on?: unknown };
  const id = typeof body.id === 'string' ? body.id.slice(0, 40) : '';
  const db = env.DB;
  const who = await visitor(request);
  if (!(await allow(db, `vote:${who.network}`, 60, 60))) return reply({ ok: false, message: 'That is a lot at once. Try again in a minute.' }, 429);
  const live = await db.prepare("SELECT 1 FROM suggestions WHERE id = ?1 AND status = 'live'").bind(id).first();
  if (!live) return reply({ ok: false, message: site.errorLine }, 404);
  const result = await vote(db, id, who.voter, typeof body.on === 'boolean' ? body.on : undefined);
  return reply({ ok: true, ...result });
};
