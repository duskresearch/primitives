import { readdir, writeFile } from 'node:fs/promises';
const root = new URL('../src/instruments/', import.meta.url);
const live = [];
for (const primitive of await readdir(root, { withFileTypes: true })) {
  if (!primitive.isDirectory()) continue;
  for (const instrument of await readdir(new URL(`${primitive.name}/`, root), { withFileTypes: true })) {
    if (!instrument.isDirectory()) continue;
    const files = await readdir(new URL(`${primitive.name}/${instrument.name}/`, root));
    if (files.includes('meta.ts')) live.push(`/${primitive.name}/${instrument.name}`);
  }
}
live.sort();
await writeFile(new URL('../src/data/live-instruments.json', import.meta.url), `${JSON.stringify(live, null, 2)}\n`);
