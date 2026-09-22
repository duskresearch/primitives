import { envelopeValid, verify } from '../../src/lib/server/bridge-protocol';
import { operate } from '../../src/lib/server/operations';
import { boundedRequest } from '../../src/lib/server/body';

type Environment = { DB?: D1Database; VOTE_SALT?: string; PRIMITIVES_BRIDGE_KEY?: string; PRIMITIVES_PUBLIC_ORIGIN?: string };
const json = (data: Record<string, unknown>, status: number) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export async function handle(request: Request, env: Environment): Promise<Response> {
  if (new URL(request.url).pathname !== '/v1/operation' || request.method !== 'POST') return json({ ok: false }, 404);
  if (!env.PRIMITIVES_BRIDGE_KEY || !env.PRIMITIVES_PUBLIC_ORIGIN || !env.DB || !env.VOTE_SALT) return json({ ok: false }, 503);
  const bounded = await boundedRequest(request);
  if (!bounded) return json({ ok: false }, 413);
  let body: string;
  try {
    body = await bounded.text();
    if (body.length > 8192) return json({ ok: false }, 413);
    if (!(await verify(body, request.headers.get('x-primitives-signature'), env.PRIMITIVES_BRIDGE_KEY))) return json({ ok: false }, 401);
  } catch { return json({ ok: false }, 401); }
  let envelope;
  try { envelope = JSON.parse(body); } catch { return json({ ok: false }, 400); }
  if (!envelopeValid(envelope, env.PRIMITIVES_PUBLIC_ORIGIN)) return json({ ok: false }, 403);
  try {
    const proxy = new Request(`${envelope.origin}/api/${envelope.operation}`, { method: envelope.method, headers: { 'user-agent': envelope.agent, origin: envelope.origin } });
    const outcome = await operate(envelope.operation, proxy, { db: env.DB, salt: env.VOTE_SALT, ip: envelope.ip }, envelope.data);
    return json(outcome, outcome.status);
  } catch { return json({ ok: false }, 503); }
}

export default { fetch: handle };
