// Builds src/data/fonts.json: every family on Google Fonts, for the Type instruments.
// Joins three sources, fetched here once, never by visitors:
//   - fonts.google.com/metadata/fonts: the current list, categories, popularity, trending,
//     date added, designers, variable axes, languages;
//   - api.fontsource.org: each family's Fontsource id, weights and styles, since previews load
//     from Fontsource on jsDelivr rather than from Google;
//   - @capsizecss/metrics: the measurements Google does not publish (x-height, cap height,
//     average width, ascent, descent, line gap), for sorting, pairing and fallbacks.
// Run `npm run fonts` to refresh; the output is committed so builds never need the network.
import { writeFile } from 'node:fs/promises';
import * as capsize from '@capsizecss/metrics/entireMetricsCollection';

const collection = capsize.entireMetricsCollection ?? capsize.default ?? capsize;

async function json(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const text = await res.text();
  // Google's metadata starts with an anti-JSON-hijacking prefix.
  return JSON.parse(text.slice(text.indexOf(text.trimStart().startsWith('[') ? '[' : '{')));
}

const google = (await json('https://fonts.google.com/metadata/fonts')).familyMetadataList;
const fontsource = await json('https://api.fontsource.org/v1/fonts?type=google');
const byFamily = new Map(fontsource.map((f) => [f.family.toLowerCase(), f]));
const metricsByFamily = new Map(Object.values(collection).map((m) => [m.familyName.toLowerCase(), m]));

const categories = { 'Sans Serif': 'sans', Serif: 'serif', Display: 'display', Handwriting: 'handwriting', Monospace: 'mono' };
const missing = [];
const fonts = [];
for (const g of google) {
  const fs = byFamily.get(g.family.toLowerCase());
  if (!fs) {
    missing.push(g.family);
    continue;
  }
  const m = metricsByFamily.get(g.family.toLowerCase());
  const latin = m?.subsets?.latin?.xWidthAvg ?? m?.xWidthAvg;
  fonts.push({
    id: fs.id,
    family: g.family,
    category: categories[g.category] ?? 'display',
    weights: fs.weights,
    italic: fs.styles.includes('italic') ? 1 : 0,
    axes: (g.axes ?? []).map((a) => [a.tag, a.min, a.max]),
    subsets: g.subsets.filter((s) => s !== 'menu'),
    popularity: g.popularity,
    trending: g.trending,
    added: g.dateAdded,
    designers: g.designers,
    // units per em, ascent, descent, line gap, cap height, x-height, average width (Latin)
    metrics: m ? [m.unitsPerEm, m.ascent, m.descent, m.lineGap, m.capHeight, m.xHeight, latin] : null,
  });
}
fonts.sort((a, b) => a.popularity - b.popularity);

// System fonts that stand in while a webfont loads, measured the same way.
const system = ['arial', 'helvetica', 'helveticaNeue', 'appleSystem', 'segoeUI', 'roboto', 'timesNewRoman', 'georgia', 'verdana', 'tahoma', 'trebuchetMS', 'courierNew']
  .map((key) => collection[key])
  .filter(Boolean)
  .map((m) => ({ family: m.familyName, category: m.category, metrics: [m.unitsPerEm, m.ascent, m.descent, m.lineGap, m.capHeight, m.xHeight, m.subsets?.latin?.xWidthAvg ?? m.xWidthAvg] }));

// Compact: short keys, and languages and designers stored once, referred to by index.
const subsets = [...new Set(fonts.flatMap((f) => f.subsets))].sort();
const designers = [...new Set(fonts.flatMap((f) => f.designers))].sort();
const compact = fonts.map((f) => ({
  i: f.id,
  f: f.family,
  c: f.category,
  w: f.weights,
  ...(f.italic ? { it: 1 } : {}),
  ...(f.axes.length ? { ax: f.axes } : {}),
  s: f.subsets.map((x) => subsets.indexOf(x)),
  p: f.popularity,
  t: f.trending,
  a: f.added,
  d: f.designers.map((x) => designers.indexOf(x)),
  m: f.metrics,
}));

const out = { generated: new Date().toISOString().slice(0, 10), subsets, designers, fonts: compact, system };
await writeFile(new URL('../src/data/fonts.json', import.meta.url), `${JSON.stringify(out)}\n`);
console.log(`fonts: ${fonts.length} families (${fonts.filter((f) => f.metrics).length} measured), ${system.length} system fonts${missing.length ? `; not on Fontsource: ${missing.join(', ')}` : ''}`);
