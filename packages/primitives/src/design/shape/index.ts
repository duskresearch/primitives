import { InputError } from '../../operation';

export const FORMS = ['circle', 'square', 'triangle', 'ngon', 'star'] as const;
export type ShapeForm = typeof FORMS[number];
export interface ShapeInput { form: ShapeForm; sides: number; radius: number; rotation: number; foreground?: string }
export interface Point { x: number; y: number }
const finite = (n: number, label: string, min: number, max: number, whole = false) => {
  if (!Number.isFinite(n) || n < min || n > max || (whole && !Number.isInteger(n))) throw new InputError(`${label} must be ${whole ? 'an integer ' : ''}from ${min} to ${max}.`);
};
const fixed = (n: number) => String(Number((Math.abs(n) < 0.00005 ? 0 : n).toFixed(4)));
const polar = (r: number, degrees: number): Point => ({ x: 50 + r * Math.cos(degrees * Math.PI / 180), y: 50 + r * Math.sin(degrees * Math.PI / 180) });
const pair = (p: Point) => `${fixed(p.x)} ${fixed(p.y)}`;
const path = (points: Point[]) => `M${pair(points[0])}${points.slice(1).map((p) => ` L${pair(p)}`).join('')} Z`;
export function validateShape(x: ShapeInput) {
  if (!FORMS.includes(x.form)) throw new InputError('Unknown form.');
  finite(x.sides, 'Sides', 3, 12, true); finite(x.radius, 'Radius', 1, 50); finite(x.rotation, 'Rotation', 0, 359);
  if (x.foreground !== undefined && !safeHex(x.foreground)) throw new InputError('Foreground must be a six-digit hex color.');
}
export function vertices(x: ShapeInput, inner = 0.5): Point[] {
  validateShape(x); finite(inner, 'Inner ratio', 0.1, 0.9);
  const count = x.form === 'triangle' ? 3 : x.form === 'square' ? 4 : x.sides;
  return Array.from({ length: x.form === 'star' ? count * 2 : count }, (_, i) =>
    polar(x.radius * (x.form === 'star' && i % 2 ? inner : 1), x.rotation - 90 + i * 360 / (x.form === 'star' ? count * 2 : count)));
}
export interface FormInput extends ShapeInput { inner: number }
export function form(x: FormInput) {
  validateShape(x); finite(x.inner, 'Inner ratio', 0.1, 0.9);
  const element = x.form === 'circle'
    ? `<circle cx="50" cy="50" r="${fixed(x.radius)}"${x.rotation ? ` transform="rotate(${fixed(x.rotation)} 50 50)"` : ''} fill="${x.foreground ?? 'currentColor'}"/>`
    : `<path d="${path(vertices(x, x.inner))}" fill="${x.foreground ?? 'currentColor'}"/>`;
  return { element, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${element}</svg>` };
}

export const POLYGON_PRESETS = ['triangle', 'square', 'hexagon', 'star', 'custom'] as const;
export type PolygonPreset = typeof POLYGON_PRESETS[number];
export interface PolygonInput extends ShapeInput { points: Point[] }
export function polygon(x: PolygonInput) {
  validateShape(x);
  if (!Array.isArray(x.points) || x.points.length < 3 || x.points.length > 12) throw new InputError('Polygon needs 3 to 12 vertices.');
  x.points.forEach((p) => { if (!p || typeof p !== 'object') throw new InputError('Invalid point.'); finite(p.x, 'X', 0, 100); finite(p.y, 'Y', 0, 100); });
  const css = `clip-path: polygon(${x.points.map((p) => `${fixed(p.x)}% ${fixed(p.y)}%`).join(', ')});`;
  return { css, coloredCss: `background-color: ${x.foreground ?? 'currentColor'};\n${css}`, points: x.points.map((p) => ({ x: p.x, y: p.y })), fillRule: 'nonzero' as const };
}
export function presetPoints(x: ShapeInput, preset: Exclude<PolygonPreset, 'custom'>): Point[] {
  validateShape(x);
  if (!['triangle', 'square', 'hexagon', 'star'].includes(preset)) throw new InputError('Unknown polygon preset.');
  const formName = preset === 'hexagon' ? 'ngon' : preset;
  // A star needs two vertices per tip. Keep this editor's twelve-vertex limit
  // without changing the shared side count used by Form and Favicon.
  const sides = preset === 'hexagon' ? 6 : preset === 'star' ? Math.min(x.sides, 6) : x.sides;
  return vertices({ ...x, form: formName, sides }).map((p) => ({ x: Number(fixed(p.x)), y: Number(fixed(p.y)) }));
}

export interface CornerInput extends ShapeInput { cornerRadius: number; smoothing: number }
// CSS Borders 4 defines the superellipse exponent as 2^K; K=1 is round and K=2 is squircle.
export function corner(x: CornerInput) {
  validateShape(x); finite(x.cornerRadius, 'Corner radius', 0, 50); finite(x.smoothing, 'Smoothing', 0, 1);
  const r = x.cornerRadius, exponent = 2 ** (1 + x.smoothing);
  const coords: Point[] = [];
  const add = (px: number, py: number) => coords.push({ x: px, y: py });
  add(r, 0); add(100 - r, 0);
  for (let i = 1; i <= 16; i++) { const t = i * Math.PI / 32; add(100-r+r*Math.sin(t)**(2/exponent), r-r*Math.cos(t)**(2/exponent)); }
  add(100, 100-r);
  for (let i = 1; i <= 16; i++) { const t = i * Math.PI / 32; add(100-r+r*Math.cos(t)**(2/exponent), 100-r+r*Math.sin(t)**(2/exponent)); }
  add(r, 100);
  for (let i = 1; i <= 16; i++) { const t = i * Math.PI / 32; add(r-r*Math.sin(t)**(2/exponent), 100-r+r*Math.cos(t)**(2/exponent)); }
  add(0, r);
  for (let i = 1; i <= 16; i++) { const t = i * Math.PI / 32; add(r-r*Math.cos(t)**(2/exponent), r-r*Math.sin(t)**(2/exponent)); }
  const d = path(coords);
  const css = `border-radius: ${fixed(r)}%;${x.smoothing ? `\ncorner-shape: superellipse(${fixed(1+x.smoothing)});` : ''}`;
  return { path: d, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${d}" fill="${x.foreground ?? 'currentColor'}"/></svg>`, css, exponent, points: coords };
}

export interface BlobInput extends ShapeInput { seed: number; complexity: number; irregularity: number }
// Mulberry32, explicitly seeded 32-bit generator.
const mulberry32 = (seed: number) => () => { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export function blob(x: BlobInput) {
  validateShape(x); finite(x.seed, 'Seed', 0, 4294967295, true); finite(x.complexity, 'Complexity', 3, 12, true); finite(x.irregularity, 'Irregularity', 0, 0.35);
  const random = mulberry32(x.seed);
  const knots = Array.from({ length: x.complexity }, (_, i) => polar(x.radius * (1-x.irregularity*random()), x.rotation-90+360*i/x.complexity));
  // Midpoint quadratic segments stay in the convex hull of neighboring knots, hence within the viewBox.
  const mid = (a: Point, b: Point): Point => ({ x: (a.x+b.x)/2, y: (a.y+b.y)/2 });
  const d = `M${pair(mid(knots.at(-1)!, knots[0]))}${knots.map((p, i) => ` Q${pair(p)} ${pair(mid(p, knots[(i+1)%knots.length]))}`).join('')} Z`;
  return { path: d, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${d}" fill="${x.foreground ?? 'currentColor'}"/></svg>`, knots };
}

export interface FaviconInput extends FormInput { background: string; padding: number }
const safeHex = (s: string) => /^#[0-9a-fA-F]{6}$/.test(s);
export function favicon(x: FaviconInput) {
  validateShape(x); finite(x.inner, 'Inner ratio', 0.1, 0.9); finite(x.padding, 'Padding', 0, 30);
  if (!safeHex(x.background)) throw new InputError('Background must be a six-digit hex color.');
  const element = form(x).element;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${x.background}"/><g transform="translate(${fixed(x.padding)} ${fixed(x.padding)}) scale(${fixed((100-2*x.padding)/100)})">${element}</g></svg>`;
  const files = ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'site.webmanifest', 'integration.html'];
  const manifest = JSON.stringify({ name: 'Shape icon', icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 2);
  const html = `<link rel="icon" href="favicon.svg" type="image/svg+xml">\n<link rel="icon" href="favicon.ico" sizes="any">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">\n<link rel="manifest" href="site.webmanifest">`;
  return { svg, manifest, html, files };
}

export const operations = { form, polygon, corner, blob, favicon };
