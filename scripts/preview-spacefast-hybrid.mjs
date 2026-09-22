// Local-only approximation: synthetic bridge key and disposable D1, never project secrets.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { Readable } from 'node:stream';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import worker from '../dist-spacefast/server/spacefast-entry.mjs';

const key = 'synthetic-local-preview-key-0123456789';
const host = 'http://127.0.0.1:4400';
const root = resolve('dist-spacefast/client');
const built = await build({ entryPoints: ['workers/business-api/index.ts'], bundle: true, format: 'esm', platform: 'neutral', write: false, tsconfig: 'tsconfig.json' });
const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: built.outputFiles[0].text, compatibilityDate: '2026-09-22', d1Databases: ['DB'], bindings: { VOTE_SALT: 'synthetic-local-preview-salt', PRIMITIVES_PUBLIC_ORIGIN: host, PRIMITIVES_BRIDGE_KEY: key }, cf: false, unsafeDisableTelemetry: true }));
const DB = await mf.getD1Database('DB');
const schema = (await readFile('migrations/0001_requests.sql', 'utf8')).split('\n').map((line) => line.replace(/--.*$/, '')).join('\n');
for (const statement of schema.split(';').map((sql) => sql.trim()).filter(Boolean)) await DB.prepare(statement).run();
const fetchOriginal = globalThis.fetch;
globalThis.fetch = (input, init) => {
  if (String(input) === 'https://synthetic-backend.example/v1/operation') {
    return mf.dispatchFetch(String(input), init);
  }
  return fetchOriginal(input, init);
};

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
const server = createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url ?? '/', host);
    if (url.pathname.split('/').some((part) => part === '..' || part.startsWith('.')) || /%2f|%5c/i.test(incoming.url ?? '')) return void outgoing.writeHead(404).end();
    if (incoming.method === 'GET' || incoming.method === 'HEAD') {
      const candidate = resolve(root, `.${url.pathname === '/' ? '/index.html' : url.pathname}`);
      for (const path of [candidate, `${candidate}.html`]) {
        if (!path.startsWith(`${root}${sep}`)) continue;
        const info = await stat(path).catch(() => null);
        if (!info?.isFile()) continue;
        outgoing.writeHead(200, { 'content-type': mime[extname(path)] ?? 'application/octet-stream' });
        if (incoming.method === 'HEAD') outgoing.end(); else createReadStream(path).pipe(outgoing);
        return;
      }
    }
    const body = incoming.method === 'GET' || incoming.method === 'HEAD' ? undefined : Readable.toWeb(incoming);
    const headers = { ...incoming.headers, 'x-forwarded-for': incoming.socket.remoteAddress ?? '127.0.0.1' };
    const request = new Request(`${host}${incoming.url}`, { method: incoming.method, headers, body, duplex: body ? 'half' : undefined });
    const response = await worker.fetch(request, { PRIMITIVES_SPACEFAST_BACKEND_READY: 'verified', PRIMITIVES_BACKEND_ORIGIN: 'https://synthetic-backend.example', PRIMITIVES_BRIDGE_KEY: key }, {});
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (!response.body || incoming.method === 'HEAD') outgoing.end(); else Readable.fromWeb(response.body).pipe(outgoing);
  } catch { outgoing.writeHead(500).end('Preview error'); }
});
server.listen(4400, '127.0.0.1', () => console.log(`${host} (local hybrid preview; disposable synthetic D1)`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { server.close(); await mf.dispose(); process.exit(0); });
