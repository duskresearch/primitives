// Gzip in front of `astro preview`, because Cloudflare compresses in production and the
// preview server does not. Without this, Lighthouse charges a page for bytes no visitor
// ever downloads: Type's pages scored 81 to 96 uncompressed and 99 through here.
//
//   npx astro preview --port 4322     # the build
//   node scripts/gzip-preview.mjs     # this, on 4323
//
// Then point Lighthouse or Playwright at http://localhost:4323.
import http from 'node:http';
import { gzipSync } from 'node:zlib';

const FROM = Number(process.env.PORT ?? 4323);
const TO = Number(process.env.PREVIEW_PORT ?? 4322);
const COMPRESSIBLE = /text|javascript|json|css|svg|xml/;

http
  .createServer((req, res) => {
    const upstream = http.request(
      { host: 'localhost', port: TO, path: req.url, method: req.method, headers: { ...req.headers, host: `localhost:${TO}`, 'accept-encoding': 'identity' } },
      (from) => {
        const chunks = [];
        from.on('data', (c) => chunks.push(c));
        from.on('end', () => {
          let body = Buffer.concat(chunks);
          const headers = { ...from.headers };
          delete headers['content-length'];
          if (COMPRESSIBLE.test(headers['content-type'] ?? '') && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
            body = gzipSync(body);
            headers['content-encoding'] = 'gzip';
          }
          headers['content-length'] = body.length;
          res.writeHead(from.statusCode, headers);
          res.end(body);
        });
      },
    );
    upstream.on('error', (e) => {
      res.writeHead(502, { 'content-type': 'text/plain' });
      res.end(`No preview on ${TO}: ${e.message}\n`);
    });
    req.pipe(upstream);
  })
  .on('error', (e) => {
    console.error(e.code === 'EADDRINUSE' ? `Port ${FROM} is taken. Stop the other proxy, or set PORT.` : e.message);
    process.exit(1);
  })
  .listen(FROM, () => console.log(`gzip proxy on http://localhost:${FROM}, serving the preview on ${TO}`));
