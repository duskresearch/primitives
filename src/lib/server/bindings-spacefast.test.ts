import { describe, expect, it } from 'vitest';
import { bindings } from './bindings-spacefast';
import { visitor } from './visitor';

const request = (ip = '203.0.113.5') => new Request('https://primitiv.es/requests', { headers: { 'x-forwarded-for': ip, 'user-agent': 'test' } });
const locals = (env: Record<string, unknown>) => ({ runtime: { env } }) as App.Locals;
describe('Spacefast request bindings', () => {
  it('never exposes a local DB or salt, even if legacy bindings were supplied', () => {
    expect(() => bindings(locals({ DB: {}, VOTE_SALT: 'synthetic', PRIMITIVES_SPACEFAST_BACKEND_READY: 'verified' }), request())).toThrow('no direct database');
  });

  it('refuses shared local identity and fallback salt outside development', async () => {
    await expect(visitor(request(), { salt: 'secret' }, false)).rejects.toThrow('Trusted visitor IP missing');
    await expect(visitor(request(), { ip: '203.0.113.5' }, false)).rejects.toThrow('VOTE_SALT binding missing');
  });
});
