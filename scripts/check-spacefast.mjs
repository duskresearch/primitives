// Local build-artifact smoke check. It does not emulate hosted Functions or the DB broker.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import catalogue from '../src/data/catalogue.json' with { type: 'json' };

const manifest = JSON.parse(await readFile(new URL('../.spacefast/build.json', import.meta.url), 'utf8'));
assert.equal(manifest.staticDir, 'dist-spacefast/client');
assert.equal(manifest.serverEntry, 'dist-spacefast/server/spacefast-entry.mjs');
const dynamic = new Set(manifest.routes.filter((route) => route.renderClass === 'dynamic').map((route) => route.pathname));
const tools = catalogue.primitives.flatMap((primitive) => primitive.instruments.map((instrument) => `/${primitive.slug}/${instrument.slug}`));
assert.equal(tools.length, 50);
for (const route of [...tools, '/requests', '/requests/row/[id]', '/api/request', '/api/vote', '/api/subscribe']) assert(dynamic.has(route), `${route} must be dynamic`);

const worker = (await import('../dist-spacefast/server/spacefast-entry.mjs')).default;
async function fetch(path, init = {}) { return worker.fetch(new Request(`https://primitiv.es${path}`, init), {}, {}); }
const tool = await fetch('/color/pick?a=abcdef');
assert.equal(tool.status, 200);
assert.match(await tool.text(), /abcdef/i, 'nondefault color must render in initial HTML');
for (const path of ['/requests', '/requests/row/nope']) assert.equal((await fetch(path)).status, 503, path);
for (const path of ['/api/request', '/api/vote', '/api/subscribe']) {
  const response = await fetch(path, { method: 'POST', headers: { origin: 'https://primitiv.es', 'content-type': 'application/json' }, body: '{}' });
  assert.equal(response.status, 503, path);
}
for (const path of ['/api/request', '/api/subscribe']) {
  const response = await fetch(path, { method: 'POST', headers: { origin: 'https://primitiv.es', 'content-type': 'application/x-www-form-urlencoded' }, body: 'website=' });
  assert.equal(response.status, 503, `${path} HTML form`);
  assert.equal(response.headers.get('cache-control'), 'no-store');
}
console.log(`Spacefast local artifact: ${tools.length} dynamic tools, query SSR and five backend paths checked`);
