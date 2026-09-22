// Toggle a visitor's vote on a live idea. One vote per visitor per idea.
import type { APIRoute } from 'astro';
import { bindings } from '#runtime-bindings';
import { site } from '@/lib/catalogue';
import { reply, sameOrigin } from '@/lib/server/visitor';
import { operate } from '@/lib/server/operations';
import { remote, remoteBinding } from '#bridge-site';
import { boundedRequest } from '@/lib/server/body';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!sameOrigin(request)) return reply({ ok: false, message: site.errorLine }, 403);
  const bounded = await boundedRequest(request);
  if (!bounded) return reply({ ok: false, message: 'Request too large.' }, 413);
  const data = await bounded.json().catch(() => ({}));
  if (!data || typeof data !== 'object' || Array.isArray(data)) return reply({ ok: false, message: site.errorLine }, 400);
  try {
    const value = remoteBinding() ? await remote('vote', request, locals, data) : await operate('vote', request, bindings(locals, request), data, import.meta.env.DEV);
    return reply(value.data, value.status);
  } catch { return reply({ ok: false, message: 'Requests are temporarily unavailable.' }, 503); }
};
