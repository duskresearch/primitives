import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import migrationSql from '../../../migrations/0001_requests.sql?raw';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { handle } from '../../../workers/business-api/index';
import { remote } from './bridge-site';
import { sign } from './bridge-protocol';
import { sameOrigin, visitor } from './visitor';
import { boundedRequest, readBody } from './body';

const secret = 'synthetic-local-test-key-only-0123456789';
const env = { PRIMITIVES_BRIDGE_KEY: secret, PRIMITIVES_PUBLIC_ORIGIN: 'https://primitiv.es', VOTE_SALT: 'synthetic-salt' };
const locals = { runtime: { env: { PRIMITIVES_SPACEFAST_BACKEND_READY: 'verified', PRIMITIVES_BACKEND_ORIGIN: 'https://backend.example', PRIMITIVES_BRIDGE_KEY: secret } } } as App.Locals;
const request = (ip = '203.0.113.5') => new Request('https://primitiv.es/requests', { headers: { 'x-forwarded-for': ip, 'user-agent': 'synthetic browser' } });
let mf: Miniflare;
let db: D1Database;
const transport = (input: RequestInfo | URL, init?: RequestInit) => handle(new Request(input, init), { ...env, DB: db });
const call = (op: 'board' | 'row' | 'request' | 'vote' | 'subscribe', data: Record<string, unknown> = {}, ip?: string) => remote(op, request(ip), locals, data, transport);

beforeAll(async () => {
  mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: ['DB'], cf: false, unsafeDisableTelemetry: true }));
  db = await mf.getD1Database('DB') as D1Database;
  const migration = migrationSql.split('\n').map((line: string) => line.replace(/--.*$/, '')).join('\n');
  for (const statement of migration.split(';').map((sql: string) => sql.trim()).filter(Boolean)) await db.prepare(statement).run();
});
afterAll(async () => { await mf?.dispose(); });

describe('authenticated business bridge with disposable D1', () => {
  it('rejects unsigned and malformed envelopes before consulting DB', async () => {
    const unavailable = { ...env, DB: { prepare() { throw new Error('DB accessed'); }, batch() { throw new Error('DB accessed'); } } as D1Database };
    const unsigned = await handle(new Request('https://backend.example/v1/operation', { method: 'POST', body: '{}' }), unavailable);
    expect(unsigned.status).toBe(401);
    const invalid = await handle(new Request('https://backend.example/v1/operation', { method: 'POST', body: '{}' , headers: { 'x-primitives-signature': await sign('{}', secret) } }), unavailable);
    expect(invalid.status).toBe(403);
    expect((await handle(new Request('https://backend.example/unknown'), unavailable)).status).toBe(404);
  });

  it('checks signatures, timestamp, origin and trusted address', async () => {
    const base = { operation: 'board', method: 'GET', origin: 'https://primitiv.es', ip: '203.0.113.5', agent: 'synthetic browser', timestamp: Date.now(), data: {} };
    for (const patch of [{ origin: 'https://other.example' }, { ip: '' }, { timestamp: Date.now() - 120_000 }, { operation: 'sql' }, { method: 'POST' }]) {
      const body = JSON.stringify({ ...base, ...patch });
      const response = await handle(new Request('https://backend.example/v1/operation', { method: 'POST', body, headers: { 'x-primitives-signature': await sign(body, secret) } }), { ...env, DB: db });
      expect(response.status).toBe(403);
    }
    expect((await handle(new Request('https://backend.example/v1/operation', { method: 'POST', body: '{}', headers: { 'x-primitives-signature': '0'.repeat(64) } }), { ...env, DB: db })).status).toBe(401);
    expect(sameOrigin(new Request('https://primitiv.es/api/request', { headers: { origin: 'null' } }))).toBe(false);
    expect(sameOrigin(new Request('https://primitiv.es/api/request', { headers: { origin: 'nonsense' } }))).toBe(false);
  });

  it('supports board, suggestions, repeats, explicit votes, rows and per-visitor separation', async () => {
    expect((await call('board')).data.ideas).toEqual([]);
    const added = await call('request', { text: 'Halftone', page: '/requests' });
    expect(added.status).toBe(201);
    expect(added.data.outcome).toBe('new');
    const id = added.data.id as string;
    expect((await call('row', { id })).data.voted).toBe(false);
    expect((await call('request', { text: 'Halftone', page: '/requests' })).data.outcome).toBe('repeat');
    expect((await call('vote', { id, on: true })).data.votes).toBe(1);
    expect((await call('vote', { id, on: true })).data.votes).toBe(1);
    expect((await call('vote', { id, on: true }, '203.0.113.6')).data.votes).toBe(2);
    expect((await call('row', { id }, '203.0.113.6')).data.voted).toBe(true);
    expect((await call('vote', { id, on: false })).data.votes).toBe(1);
    expect((await call('board')).data.ideas).toMatchObject([{ id, votes: 1 }]);
    expect((await call('vote', { id: 'missing', on: true })).status).toBe(404);
    expect(await visitor(request(), { ip: '203.0.113.5', salt: env.VOTE_SALT }, false)).toEqual({
      network: '809f02559c73ae858cac9ddca935fd69720f8039f5c349ab5ffa3458cc338139',
      voter: '8869760e6903c8d81cff0bf524580e178a32f563aaa512bfb024b80d39fa4674',
    });
  });

  it('moderates, preserves honeypots, deduplicates subscribers, and limits bursts', async () => {
    expect((await call('request', { text: 'x', website: 'bot' }, '203.0.113.10')).status).toBe(201);
    expect((await call('request', { text: 'x' }, '203.0.113.10')).status).toBe(422);
    expect((await call('subscribe', { email: 'SYNTHETIC@example.test' })).status).toBe(200);
    expect((await call('subscribe', { email: 'synthetic@example.test' })).status).toBe(200);
    expect((await db.prepare('SELECT count(*) AS n FROM subscribers').first<{ n: number }>())?.n).toBe(1);
    expect((await call('subscribe', { email: 'invalid' })).status).toBe(422);
    for (let n = 0; n < 5; n++) await call('subscribe', { email: 'synthetic@example.test' }, '203.0.113.30');
    expect((await call('subscribe', { email: 'synthetic@example.test' }, '203.0.113.30')).status).toBe(429);
  });

  it('fails closed for invalid destinations, redirects and missing backend', async () => {
    await expect(remote('board', request(), { runtime: { env: { ...locals.runtime!.env, PRIMITIVES_BACKEND_ORIGIN: 'http://backend.example' } } } as App.Locals, {}, transport)).rejects.toThrow('configuration');
    await expect(remote('board', request(), { runtime: { env: {} } } as App.Locals, {}, transport)).rejects.toThrow('not verified');
    await expect(remote('board', request(), locals, {}, async () => Response.redirect('https://elsewhere.example'))).rejects.toThrow('redirect');
    await expect(remote('board', request(), locals, {}, async () => { throw new Error('down'); })).rejects.toThrow('down');
    await expect(remote('board', new Request('https://primitiv.es/requests'), locals, {}, transport)).rejects.toThrow('identity');
    await expect(remote('board', request(), locals, {}, async () => new Response('x'.repeat(262145)))).rejects.toThrow('too large');
    await expect(remote('board', request(), locals, {}, async (_url, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))))).rejects.toThrow('aborted');
  });

  it('rejects chunked oversized bodies and treats array or null JSON as empty input', async () => {
    const oversized = new Request('https://primitiv.es/api/request', { method: 'POST', body: 'x'.repeat(8193) });
    expect(await boundedRequest(oversized)).toBeNull();
    for (const payload of ['[]', 'null', '42']) {
      const input = new Request('https://primitiv.es/api/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload });
      expect((await readBody(input)).data).toEqual({});
    }
  });
});
