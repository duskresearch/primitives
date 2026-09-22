import type { Operation, Result } from './operations';

export interface Envelope {
  operation: Operation;
  method: 'GET' | 'POST';
  origin: string;
  ip: string;
  agent: string;
  timestamp: number;
  data: Record<string, unknown>;
}

const encoder = new TextEncoder();
async function key(secret: string): Promise<CryptoKey> {
  if (secret.length < 32) throw new Error('Bridge key missing or too short');
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function sign(body: string, secret: string): Promise<string> {
  const signature = await crypto.subtle.sign('HMAC', await key(secret), encoder.encode(body));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verify(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const bytes = Uint8Array.from(signature.match(/../g)!, (x) => parseInt(x, 16));
  return crypto.subtle.verify('HMAC', await key(secret), bytes, encoder.encode(body));
}

export function envelopeValid(value: unknown, publicOrigin: string, now = Date.now()): value is Envelope {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Partial<Envelope>;
  const method = v.operation === 'board' || v.operation === 'row' ? 'GET' : 'POST';
  return ['board', 'row', 'request', 'vote', 'subscribe'].includes(v.operation ?? '') && v.method === method &&
    v.origin === publicOrigin && typeof v.ip === 'string' && v.ip.length > 0 && v.ip.length < 128 &&
    typeof v.agent === 'string' && v.agent.length < 512 && typeof v.timestamp === 'number' &&
    Math.abs(now - v.timestamp) <= 60_000 && Boolean(v.data && typeof v.data === 'object' && !Array.isArray(v.data));
}

export function resultValid(value: unknown): value is Result {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<Result>;
  return Number.isInteger(v.status) && v.status! >= 200 && v.status! < 500 && Boolean(v.data && typeof v.data === 'object' && !Array.isArray(v.data));
}
