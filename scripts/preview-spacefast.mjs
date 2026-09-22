// Loopback-only approximation. Spacefast Functions, routing, headers and DB are not emulated.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { Readable } from 'node:stream';
import worker from '../dist-spacefast/server/spacefast-entry.mjs';

const root = resolve('dist-spacefast/client');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url ?? '/', 'http://127.0.0.1:4398');
    const parts = url.pathname.split('/');
    if (parts.some((part) => part === '..' || part.startsWith('.')) || /%2f|%5c/i.test(incoming.url ?? '')) {
      outgoing.writeHead(404).end(); return;
    }
    if (incoming.method === 'GET' || incoming.method === 'HEAD') {
      const candidate = resolve(root, `.${url.pathname === '/' ? '/index.html' : url.pathname}`);
      for (const path of [candidate, `${candidate}.html`]) {
        if (!path.startsWith(`${root}${sep}`)) continue;
        const info = await stat(path).catch(() => null);
        if (!info?.isFile()) continue;
        outgoing.writeHead(200, { 'content-type': mime[extname(path)] ?? 'application/octet-stream' });
        if (incoming.method === 'HEAD') outgoing.end();
        else createReadStream(path).pipe(outgoing);
        return;
      }
    }
    const body = incoming.method === 'GET' || incoming.method === 'HEAD' ? undefined : Readable.toWeb(incoming);
    const request = new Request(`http://127.0.0.1:4398${incoming.url}`, { method: incoming.method, headers: incoming.headers, body, duplex: body ? 'half' : undefined });
    const response = await worker.fetch(request, {}, {});
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (!response.body || incoming.method === 'HEAD') outgoing.end();
    else Readable.fromWeb(response.body).pipe(outgoing);
  } catch (error) {
    console.error('preview request failed', error);
    outgoing.writeHead(500).end('Preview error');
  }
}).listen(4398, '127.0.0.1', () => console.log('Local Spacefast artifact preview: http://127.0.0.1:4398 (backend disabled)'));
