import { describe, expect, it } from 'vitest';
import { bindings } from './bindings-spacefast';
import { requireDb, visitor } from './visitor';

const request = (ip = '203.0.113.5') => new Request('https://primitiv.es/requests', { headers: { 'x-forwarded-for': ip, 'user-agent': 'test' } });
const locals = (env: Record<string, unknown>) => ({ runtime: { env } }) as App.Locals;
const db = { prepare() { throw new Error('unused'); } } as unknown as D1Database;

describe('Spacefast request bindings', () => {
  it('starts disabled even with DB, salt and forwarded address', () => {
    expect(() => bindings(locals({ DB: db, VOTE_SALT: 'secret' }), request())).toThrow('backend disabled');
  });

  it.each([
    [{ VOTE_SALT: 'secret' }, request()],
    [{ DB: db }, request()],
    [{ DB: db, VOTE_SALT: 'secret' }, new Request('https://primitiv.es/requests')],
  ])('rejects missing DB, salt or address after explicit opt-in', (variables, req) => {
    expect(() => bindings(locals({ ...variables, PRIMITIVES_SPACEFAST_BACKEND_READY: 'verified' }), req)).toThrow('requires DB');
  });

  it('reads each request separately, using the adapter-defined first forwarded hop', async () => {
    const runtime = locals({ DB: db, VOTE_SALT: 'secret', PRIMITIVES_SPACEFAST_BACKEND_READY: 'verified' });
    const first = bindings(runtime, request('203.0.113.5, 10.0.0.1'));
    const second = bindings(runtime, request('203.0.113.6, 10.0.0.1'));
    expect(first.ip).toBe('203.0.113.5');
    expect(second.ip).toBe('203.0.113.6');
    expect(requireDb(first.db)).toBe(db);
    expect((await visitor(request(), first, false)).network).not.toBe((await visitor(request(), second, false)).network);
    expect(await visitor(request(), first, false)).toEqual(await visitor(request(), first, false));
  });

  it('refuses shared local identity and fallback salt outside development', async () => {
    await expect(visitor(request(), { salt: 'secret' }, false)).rejects.toThrow('Trusted visitor IP missing');
    await expect(visitor(request(), { ip: '203.0.113.5' }, false)).rejects.toThrow('VOTE_SALT binding missing');
    expect(() => requireDb(undefined)).toThrow('DB binding missing');
  });
});
