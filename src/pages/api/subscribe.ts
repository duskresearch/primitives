// The email line: one row per address in D1, as the other Dusk projects keep their lists.
import type { APIRoute } from 'astro';
import { bindings } from '#runtime-bindings';
import { answer, readBody } from '@/lib/server/body';
import { sameOrigin } from '@/lib/server/visitor';
import { operate } from '@/lib/server/operations';
import { remote, remoteBinding } from '#bridge-site';
import { boundedRequest } from '@/lib/server/body';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!sameOrigin(request)) return new Response('Forbidden', { status: 403 });
  const bounded = await boundedRequest(request);
  if (!bounded) return new Response('Request too large.', { status: 413 });
  const { data, json } = await readBody(bounded);
  try {
    const value = remoteBinding() ? await remote('subscribe', request, locals, data) : await operate('subscribe', request, bindings(locals, request), data, import.meta.env.DEV);
    return answer(request, json, value.data, value.status);
  } catch { return new Response(json ? JSON.stringify({ ok: false, message: 'Requests are temporarily unavailable.' }) : 'Requests are temporarily unavailable.', { status: 503, headers: { 'content-type': json ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', 'cache-control': 'no-store' } }); }
};
