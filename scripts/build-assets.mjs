// Generates every image derived from the Primitives mark and the catalogue:
//   public/favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png (180),
//   icon-192.png, icon-512.png, icon-maskable-512.png, public/og/**.png,
//   src/generated/og.json (cache-busting hashes), design/brand/avatar*.png.
// Sources: src/lib/logo.ts (the mark), src/lib/mark-svg.ts (primitive marks),
// src/lib/catalogue.ts (content). Layout follows design/README.md and design/MARK.md.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { runnerImport } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const at = (p) => `${root}${p}`;
const config = { configFile: false, root, logLevel: 'error', resolve: { alias: { '@': at('src') } } };
const load = async (id) => (await runnerImport(id, config)).module;

const { primitives, site } = await load('/src/lib/catalogue.ts');
const logo = await load('/src/lib/logo.ts');
const { markSvg } = await load('/src/lib/mark-svg.ts');
const { OG } = await load('/src/lib/og.ts');
const tokens = JSON.parse(await readFile(at('src/data/tokens.json'), 'utf8'));
const c = tokens.color;

const write = async (path, data) => {
  await mkdir(dirname(at(path)), { recursive: true });
  await writeFile(at(path), data);
};
const png = (svg, width) => new Resvg(svg, { fitTo: width ? { mode: 'width', value: width } : { mode: 'original' } }).render().asPng();

// ── Icons ────────────────────────────────────────────────────────────────────────────

function ico(images) {
  // ICONDIR + one ICONDIRENTRY per image, then the PNGs themselves.
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((im) => im.data)]);
}

// Tiles use the app's own paper and ink, like the wordmark: never pure white.
const TILE = logo.PAPER;
const appRadius = 14 / 64; // the reference app icon: 14 px on a 64 px tile

await write('public/favicon.svg', logo.faviconSvg());
await write(
  'public/favicon.ico',
  ico([16, 32, 48].map((size) => ({ size, data: png(logo.logoPixelSvg(size)) }))),
);
// iOS masks the touch icon itself and fills transparent corners with black, so it is full bleed.
await write('public/apple-touch-icon.png', png(logo.tileSvg({ size: 180, background: TILE, color: logo.INK })));
for (const size of [192, 512]) {
  await write(`public/icon-${size}.png`, png(logo.tileSvg({ size, background: TILE, color: logo.INK, radius: appRadius })));
}
await write('public/icon-maskable-512.png', png(logo.tileSvg({ size: 512, background: TILE, color: logo.INK })));
await write('design/brand/avatar.png', png(logo.tileSvg({ size: 400, background: TILE, color: logo.INK })));
await write('design/brand/avatar-ink.png', png(logo.tileSvg({ size: 400, background: logo.INK, color: logo.PAPER })));

// ── OG images ────────────────────────────────────────────────────────────────────────

// Satori turns text into paths, so rasterizing at OG.scale upsamples nothing.
const W = OG.width;
const H = OG.height;
const INSET = 48;
const font = (file) => readFile(at(`node_modules/@fontsource/${file}`));
const fonts = [
  ...[300, 400, 500].map(async (weight) => ({ name: 'Hanken Grotesk', weight, style: 'normal', data: await font(`hanken-grotesk/files/hanken-grotesk-latin-${weight}-normal.woff`) })),
  (async () => ({ name: 'Geist Mono', weight: 400, style: 'normal', data: await font('geist-mono/files/geist-mono-latin-400-normal.woff') }))(),
];
const loadedFonts = await Promise.all(fonts);

/** Minimal element builder for satori (no React needed). */
const el = (style, ...children) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children: children.flat() } });
const mono = (text, style = {}) => el({ fontFamily: 'Geist Mono', fontSize: 20, color: c.ink2, ...style }, text);

/**
 * A primitive mark: SVG layers injected after layout, the letter (Type) laid out as text.
 * `align` positions by what the mark covers rather than its box: 'left' puts its drawn
 * left edge at x, 'center' centers it on (x, y).
 */
function placeMark(p, x, y, size, overlays, children, align = 'box') {
  const m = markSvg(p, size);
  const { x0, y0, x1, y1 } = m.bounds;
  if (align === 'left') x -= x0;
  if (align === 'top-right') [x, y] = [x - x1, y - y0];
  if (align === 'center') [x, y] = [x - (x0 + x1) / 2, y - (y0 + y1) / 2];
  overlays.push(`<g transform="translate(${x} ${y})">${m.svg}</g>`);
  if (m.letter) {
    children.push(
      el(
        { position: 'absolute', left: x, top: y, width: size, height: size, alignItems: 'center', justifyContent: 'center', opacity: p.shipped ? 1 : 0.6 },
        el({ fontFamily: 'Hanken Grotesk', fontWeight: 400, fontSize: size * 1.15, lineHeight: 1, letterSpacing: -0.05 * size * 1.15, color: m.letter.color }, m.letter.text),
      ),
    );
  }
}

async function render(children, overlays) {
  const tree = el({ position: 'relative', width: W, height: H, background: c.paper, fontFamily: 'Hanken Grotesk', color: c.ink }, children);
  const svg = await satori(tree, { width: W, height: H, fonts: loadedFonts });
  // Marks go on top of the laid-out page, drawn from the same geometry as the site.
  return png(svg.replace(/<\/svg>\s*$/, `${overlays.join('')}</svg>`), W * OG.scale);
}

const og = {};
async function emit(path, image) {
  const file = path === '/' ? 'og/index.png' : `og${path}.png`;
  await write(`public/${file}`, image);
  og[path] = createHash('sha256').update(image).digest('hex').slice(0, 10);
}

// Landing: the mark at 96, a row of the shipped primitive marks at 200 with the Primitives
// mark in the middle slot, the name, the domain and the maker along the bottom.
{
  const overlays = [logo.logoGroup(INSET, INSET, 96, logo.INK)];
  const children = [];
  const shipped = primitives.filter((p) => p.shipped);
  const middle = Math.floor(shipped.length / 2);
  const size = 200;
  // The mark's square fills its whole box; at 0.9 of the slot it matches the height of the
  // primitive marks around it (Grid's bars, the mark it replaces, are 0.9em).
  const markSize = size * 0.9;
  const gap = 20; // with Color's and Motion's overhang, the drawn row spans exactly inset to inset
  const rowY = 175;
  // Space the boxes evenly, then center the row on what the marks actually cover.
  const first = markSvg(shipped[0], size).bounds;
  const last = markSvg(shipped.at(-1), size).bounds;
  const span = (shipped.length - 1) * (size + gap) + last.x1 - first.x0;
  const rowX = (W - span) / 2 - first.x0;
  shipped.forEach((p, i) => {
    const x = rowX + i * (size + gap);
    if (i === middle) overlays.push(logo.logoGroup(x + (size - markSize) / 2, rowY + (size - markSize) / 2, markSize, logo.INK));
    else placeMark(p, x, rowY, size, overlays, children);
  });
  children.push(
    el({ position: 'absolute', left: 0, top: rowY + size + 40, width: W, justifyContent: 'center', fontSize: 40, fontWeight: 500, letterSpacing: -0.8 }, site.name),
    el({ position: 'absolute', left: INSET, right: INSET, bottom: INSET, justifyContent: 'space-between' }, mono(site.domain), mono(site.maker)),
  );
  await emit('/', await render(children, overlays));
}

// Primitive: the mark at 64 top left; its own mark at 320 on the left; number, name and
// instrument list on the right; the address bottom left.
for (const p of primitives) {
  const overlays = [logo.logoGroup(INSET, INSET, 64, logo.INK)];
  const children = [];
  const size = 320;
  placeMark(p, (INSET + 448) / 2, H / 2, size, overlays, children, 'center');
  children.push(
    el(
      { position: 'absolute', left: 512, right: INSET, top: 0, bottom: 0, flexDirection: 'column', justifyContent: 'center' },
      el({ fontFamily: 'Geist Mono', fontSize: 24, color: c.ink2 }, p.shipped ? p.n : `${p.n} · In preparation`),
      el({ marginTop: 16, fontSize: 96, fontWeight: 300, lineHeight: 1, letterSpacing: -3.84, color: p.shipped ? c.ink : c.ink2 }, p.name),
      el({ marginTop: 24, fontSize: 28, lineHeight: 1.35, color: c.ink2, lineClamp: 2 }, p.list),
    ),
    el({ position: 'absolute', left: INSET, bottom: INSET }, mono(`${site.domain}${p.href}`)),
  );
  await emit(p.href, await render(children, overlays));
}

// Instrument: the mark at 64 top left, the primitive's mark at 160 top right (apart, so the
// two never read as one logo), the instrument's name and purpose standing on the address
// line bottom left. One image per instrument, never per state.
for (const p of primitives) {
  for (const i of p.instruments.filter((x) => x.live)) {
    const overlays = [logo.logoGroup(INSET, INSET, 64, logo.INK)];
    const children = [];
    placeMark(p, W - INSET, INSET, 160, overlays, children, 'top-right');
    children.push(
      el(
        { position: 'absolute', left: INSET, right: INSET, bottom: INSET + 24 + 40, flexDirection: 'column' },
        el({ fontSize: 96, fontWeight: 300, lineHeight: 1, letterSpacing: -3.84, whiteSpace: 'nowrap' }, i.name),
        el({ marginTop: 20, fontSize: 32, lineHeight: 1.3, color: c.ink1, lineClamp: 2, maxWidth: 900 }, i.meta.purpose),
      ),
      el({ position: 'absolute', left: INSET, bottom: INSET }, mono(`${site.domain}${i.href}`)),
    );
    await emit(i.href, await render(children, overlays));
  }
}

await write('src/generated/og.json', `${JSON.stringify(og, null, 2)}\n`);
console.log(`assets: icons, ${Object.keys(og).length} OG images`);
