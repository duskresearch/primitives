// Primitive marks as SVG, for images (OG). The README forbids redrawing marks, so this
// translates the catalogue's CSS layers (see Mark.astro) into the same geometry: each
// layer is a box centered in a 1em square, then translated, with CSS border-box
// semantics for size, radius and borders. It covers the features the catalogue uses
// and throws on anything else, so a new mark cannot silently render wrong.
import { formatHex, parse, toGamut } from 'culori';
import type { MarkLayer, Primitive } from './catalogue';

const INK = '#1a1a17';
const INK2 = '#6b6a63';

const toRgb = toGamut('rgb', 'oklch');
/** resvg does not read oklch(); everything else passes through. */
function color(value: string): string {
  const v = value.trim().replace(/\bink2\b/g, INK2);
  if (!v.startsWith('oklch')) return v;
  const parsed = parse(v);
  if (!parsed) throw new Error(`Unreadable color: ${value}`);
  return formatHex(toRgb(parsed));
}

const em = (v: string, size: number) => {
  const m = /^(-?[\d.]+)em$/.exec(v.trim());
  if (!m) throw new Error(`Expected an em length, got "${v}"`);
  return Number(m[1]) * size;
};

function translate(tf: string | undefined, size: number): [number, number] {
  if (!tf) return [0, 0];
  const m = /^translate(X|Y)?\(([^)]+)\)$/.exec(tf.trim());
  if (!m) throw new Error(`Unsupported transform: ${tf}`);
  const args = m[2].split(',').map((a) => em(a, size));
  if (m[1] === 'X') return [args[0], 0];
  if (m[1] === 'Y') return [0, args[0]];
  return [args[0], args[1] ?? 0];
}

type Radii = [number, number][]; // [rx, ry] for top-left, top-right, bottom-right, bottom-left

function radii(r: string | undefined, w: number, h: number, size: number): Radii {
  if (!r) return [[0, 0], [0, 0], [0, 0], [0, 0]];
  const parts = r.trim().split(/\s+/);
  const corners = parts.length === 1 ? [parts[0], parts[0], parts[0], parts[0]] : parts;
  if (corners.length !== 4) throw new Error(`Unsupported border-radius: ${r}`);
  const radius = corners.map((c): [number, number] =>
    c.endsWith('%') ? [(Number.parseFloat(c) / 100) * w, (Number.parseFloat(c) / 100) * h] : c === '0' ? [0, 0] : [em(c, size), em(c, size)],
  );
  // CSS scales all radii down together when adjacent ones overflow a side.
  const f = Math.min(
    1,
    w / (radius[0][0] + radius[1][0] || 1),
    w / (radius[3][0] + radius[2][0] || 1),
    h / (radius[0][1] + radius[3][1] || 1),
    h / (radius[1][1] + radius[2][1] || 1),
  );
  return radius.map(([x, y]) => [x * f, y * f]);
}

/** A rounded rectangle with per-corner elliptical radii, as a closed path. */
function roundedRect(x: number, y: number, w: number, h: number, r: Radii): string {
  const [tl, tr, br, bl] = r;
  const arc = ([rx, ry]: [number, number], ex: number, ey: number) => (rx && ry ? `A${rx} ${ry} 0 0 1 ${ex} ${ey}` : `L${ex} ${ey}`);
  return [
    `M${x + tl[0]} ${y}`,
    `L${x + w - tr[0]} ${y}`,
    arc(tr, x + w, y + tr[1]),
    `L${x + w} ${y + h - br[1]}`,
    arc(br, x + w - br[0], y + h),
    `L${x + bl[0]} ${y + h}`,
    arc(bl, x, y + h - bl[1]),
    `L${x} ${y + tl[1]}`,
    arc(tl, x + tl[0], y),
    'Z',
  ].join('');
}

let uid = 0;

/** A background value as an SVG paint, adding any pattern it needs to `defs`. */
function paint(bg: string, bs: string | undefined, x: number, y: number, h: number, size: number, defs: string[]): string {
  const id = `m${++uid}`;
  const stripes = /^repeating-linear-gradient\(90deg,\s*(\S+)\s+0\s+([\d.]+em),\s*transparent\s+([\d.]+em)\s+([\d.]+em)\)$/.exec(bg);
  if (stripes) {
    const [, c, on, , period] = stripes;
    defs.push(`<pattern id="${id}" patternUnits="userSpaceOnUse" x="${x}" y="${y}" width="${em(period, size)}" height="${h}"><rect width="${em(on, size)}" height="${h}" fill="${color(c)}"/></pattern>`);
    return `url(#${id})`;
  }
  const tile = bs ? em(bs.trim().split(/\s+/)[0], size) : 0;
  const dots = /^radial-gradient\((\S+)\s+([\d.]+em),\s*transparent\s+([\d.]+em)\)$/.exec(bg);
  if (dots && tile) {
    const [, c, solid, edge] = dots;
    const r = em(edge, size);
    defs.push(
      `<radialGradient id="${id}g" gradientUnits="userSpaceOnUse" cx="${tile / 2}" cy="${tile / 2}" r="${r}"><stop offset="${em(solid, size) / r}" stop-color="${color(c)}"/><stop offset="1" stop-color="${color(c)}" stop-opacity="0"/></radialGradient>`,
      `<pattern id="${id}" patternUnits="userSpaceOnUse" x="${x}" y="${y}" width="${tile}" height="${tile}"><rect width="${tile}" height="${tile}" fill="url(#${id}g)"/></pattern>`,
    );
    return `url(#${id})`;
  }
  const checker = /^repeating-conic-gradient\((\S+)\s+0\s+25%,\s*transparent\s+0\s+50%\)$/.exec(bg);
  if (checker && tile) {
    // Conic from 12 o'clock, clockwise: filled 0–25% (upper right) and 50–75% (lower left).
    const c = color(checker[1]);
    const q = tile / 2;
    defs.push(`<pattern id="${id}" patternUnits="userSpaceOnUse" x="${x}" y="${y}" width="${tile}" height="${tile}"><rect x="${q}" width="${q}" height="${q}" fill="${c}"/><rect y="${q}" width="${q}" height="${q}" fill="${c}"/></pattern>`);
    return `url(#${id})`;
  }
  if (/gradient\(/.test(bg)) throw new Error(`Unsupported mark background: ${bg}`);
  return color(bg);
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function layerSvg(l: MarkLayer, size: number, defs: string[], bounds: Box): string {
  const b = l.bd ? em(l.bd.trim().split(/\s+/)[0], size) : 0;
  if (l.bd && !/solid/.test(l.bd)) throw new Error(`Only solid borders are supported: ${l.bd}`);
  // content-box sizing, as Mark.astro renders it: the border adds to the box.
  const w = (l.w ? em(l.w, size) : 0) + 2 * b;
  const h = (l.h ? em(l.h, size) : 0) + 2 * b;
  const [tx, ty] = translate(l.tf, size);
  const x = (size - w) / 2 + tx;
  const y = (size - h) / 2 + ty;
  const outer = radii(l.r, w, h, size);
  Object.assign(bounds, { x0: Math.min(bounds.x0, x), y0: Math.min(bounds.y0, y), x1: Math.max(bounds.x1, x + w), y1: Math.max(bounds.y1, y + h) });
  const blend = `style="mix-blend-mode:${l.blend ?? 'multiply'}"`;
  const parts: string[] = [];

  let clip = '';
  if (l.cp) {
    const m = /^polygon\((.+)\)$/.exec(l.cp.trim());
    if (!m) throw new Error(`Unsupported clip-path: ${l.cp}`);
    const points = m[1].split(',').map((pt) => {
      const [px, py] = pt.trim().split(/\s+/).map((v) => Number.parseFloat(v) / 100);
      return `${x + px * w},${y + py * h}`;
    });
    const id = `m${++uid}`;
    defs.push(`<clipPath id="${id}"><polygon points="${points.join(' ')}"/></clipPath>`);
    clip = ` clip-path="url(#${id})"`;
  }

  if (l.bg) parts.push(`<path d="${roundedRect(x, y, w, h, outer)}" fill="${paint(l.bg, l.bs, x, y, h, size, defs)}"/>`);

  if (b) {
    const colors = (l.bc ?? INK).replace(/\s*,\s*/g, ',').match(/(oklch\([^)]*\)|rgba?\([^)]*\)|\S+)/g)!;
    // A border's inner edge is concentric with its outer edge: inner radius = outer - width.
    const inner = outer.map(([rx, ry]): [number, number] => [Math.max(0, rx - b), Math.max(0, ry - b)]);
    const iw = w - 2 * b;
    const ih = h - 2 * b;
    const e = 1e-6;
    const fits = inner[0][0] + inner[1][0] <= iw + e && inner[3][0] + inner[2][0] <= iw + e && inner[0][1] + inner[3][1] <= ih + e && inner[1][1] + inner[2][1] <= ih + e;
    const ring = `${roundedRect(x, y, w, h, outer)}${roundedRect(x + b, y + b, iw, ih, inner)}`;
    if (colors.length === 1) {
      if (!fits) throw new Error(`Border radius too large for its box: ${l.r}`);
      parts.push(`<path d="${ring}" fill="${color(colors[0])}" fill-rule="evenodd"/>`);
    } else if (colors.length === 4 && colors[1] === 'transparent' && colors[2] === 'transparent' && colors[0] === colors[3]) {
      // Top and left drawn, right and bottom transparent (Motion's quarter arc). The inner
      // edge is the top-left corner's ellipse, concentric with the outer one; the drawn part
      // ends in a miter from each outer corner to its inner corner, as browsers split sides.
      const [[rx, ry]] = outer;
      const [cx, cy] = [x + rx, y + ry];
      const [irx, iry] = inner[0];
      const innerEllipse = `M${cx - irx} ${cy}a${irx} ${iry} 0 1 0 ${2 * irx} 0a${irx} ${iry} 0 1 0 ${-2 * irx} 0Z`;
      const id = `m${++uid}`;
      defs.push(`<clipPath id="${id}"><polygon points="${x},${y} ${x + w},${y} ${x + w - b},${y + b} ${x + b},${y + h - b} ${x},${y + h}"/></clipPath>`);
      parts.push(`<path d="${roundedRect(x, y, w, h, outer)}${innerEllipse}" fill="${color(colors[0])}" fill-rule="evenodd" clip-path="url(#${id})"/>`);
    } else {
      throw new Error(`Unsupported border colors: ${l.bc}`);
    }
  }

  return `<g ${blend}${clip}>${parts.join('')}</g>`;
}

export interface MarkImage {
  /** SVG elements for a size×size box with its origin at the top left. */
  svg: string;
  /** What the layers actually cover, which can spill past the box (Color's discs do). */
  bounds: Box;
  /** A letter drawn in the mark (Type's "a"); text is laid out by the caller. */
  letter?: { text: string; color: string };
}

/** A primitive's mark as SVG. Unshipped marks are drawn at 60% opacity, as on the site. */
export function markSvg(p: Primitive, size: number): MarkImage {
  const defs: string[] = [];
  const bounds: Box = p.mark.length ? { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity } : { x0: 0, y0: 0, x1: size, y1: size };
  const layers = p.mark.map((l) => layerSvg(l, size, defs, bounds)).join('');
  // Not isolated: like the CSS mark, layers multiply with whatever the mark sits on.
  const body = `<defs>${defs.join('')}</defs>${p.shipped ? layers : `<g opacity="0.6">${layers}</g>`}`;
  return { svg: body, bounds, letter: p.letter ? { text: p.letter, color: p.shipped ? INK : INK2 } : undefined };
}
