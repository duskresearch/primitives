// Who is asking, without knowing who: salted hashes stand in for visitors. Nothing that
// identifies a person is stored, and the salt never leaves the Worker.
export function requireDb(db: D1Database | undefined): D1Database {
  if (!db) throw new Error('DB binding missing');
  return db;
}

function salt(value: string | undefined, development: boolean): string {
  if (value) return value;
  if (development) return 'local-development-salt';
  throw new Error('VOTE_SALT binding missing');
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface Visitor {
  /** Hash of the network address alone: rate limits. */
  network: string;
  /** Hash of address and browser: one vote per visitor per idea. */
  voter: string;
}

export async function visitor(request: Request, binding: { salt?: string; ip?: string | null }, development = import.meta.env.DEV): Promise<Visitor> {
  const ip = binding.ip || (development ? 'local' : null);
  if (!ip) throw new Error('Trusted visitor IP missing');
  const agent = request.headers.get('user-agent') ?? '';
  const secret = salt(binding.salt, development);
  return { network: await sha256(`${secret}|${ip}`), voter: await sha256(`${secret}|${ip}|${agent}`) };
}

/** Forms may only be posted from this site. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (origin) {
    try { return new URL(origin).origin === new URL(request.url).origin; }
    catch { return false; }
  }
  return request.headers.get('sec-fetch-site') === 'same-origin';
}

/** Fixed-window rate limit: false once `limit` is passed within `seconds`. */
export async function allow(db: D1Database, key: string, limit: number, seconds: number): Promise<boolean> {
  const window = Math.floor(Date.now() / 1000 / seconds);
  const count = await db
    .prepare('INSERT INTO rate_limits (key, window, count) VALUES (?1, ?2, 1) ON CONFLICT (key, window) DO UPDATE SET count = count + 1 RETURNING count')
    .bind(key, window)
    .first<number>('count');
  if (Math.random() < 0.02) await db.prepare('DELETE FROM rate_limits WHERE window < ?1').bind(Math.floor(Date.now() / 1000 / 86400) - 2).run();
  return (count ?? 0) <= limit;
}

export function reply(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
