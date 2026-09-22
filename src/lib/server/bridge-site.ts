import type { Operation, Result } from './operations';
import { envelopeValid, resultValid, sign, type Envelope } from './bridge-protocol';

export function isIdea(value: unknown): value is import('./ideas').Idea {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && typeof item.name === 'string' &&
    (item.detail === null || typeof item.detail === 'string') &&
    (item.primitive === null || typeof item.primitive === 'string') &&
    typeof item.source === 'string' && typeof item.votes === 'number' && typeof item.created_at === 'number';
}

export function remoteBinding(): boolean { return true; }

/** Only the configured HTTPS origin receives credentials. No redirects or write retries. */
export async function remote(operation: Operation, request: Request, locals: App.Locals, data: Record<string, unknown>, transport: typeof fetch = fetch): Promise<Result> {
  const env = locals.runtime?.env;
  if (env?.PRIMITIVES_SPACEFAST_BACKEND_READY !== 'verified') throw new Error('Backend not verified');
  const origin = env.PRIMITIVES_BACKEND_ORIGIN;
  const secret = env.PRIMITIVES_BRIDGE_KEY;
  if (!origin || !secret || !/^https:\/\/[a-z0-9.-]+(?::443)?$/i.test(origin) || new URL(origin).hostname === 'localhost') throw new Error('Backend configuration invalid');
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  const envelope: Envelope = { operation, method: operation === 'board' || operation === 'row' ? 'GET' : 'POST', origin: new URL(request.url).origin, ip, agent: request.headers.get('user-agent') ?? '', timestamp: Date.now(), data };
  if (!envelopeValid(envelope, envelope.origin)) throw new Error('Visitor identity unavailable');
  const body = JSON.stringify(envelope);
  if (body.length > 8192) throw new Error('Bridge request too large');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await transport(`${origin}/v1/operation`, { method: 'POST', redirect: 'manual', signal: controller.signal, headers: { 'content-type': 'application/json', 'x-primitives-signature': await sign(body, secret) }, body });
    if (response.status >= 300 && response.status < 400) throw new Error('Backend redirect refused');
    if (response.status === 401 || response.status === 403 || response.status >= 500) throw new Error('Backend unavailable');
    const length = Number(response.headers.get('content-length'));
    if (length > 262144) throw new Error('Backend response too large');
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Backend response missing');
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 262144) { await reader.cancel(); throw new Error('Backend response too large'); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const all = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { all.set(chunk, offset); offset += chunk.byteLength; }
    const responseText = new TextDecoder().decode(all);
    const value = JSON.parse(responseText);
    if (!resultValid(value) || response.status !== value.status) throw new Error('Backend response invalid');
    return value;
  } finally { clearTimeout(timer); }
}
