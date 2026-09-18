// The Primitives mark (design/MARK.md): one square, divided once. A 1×1 square stroked
// at 0.09 inside the box, plus strokes at x = 0.5 and y = 0.5 that outline the
// upper-left quadrant. Stroke only, square caps, miter joins, never filled.
// This is the single source for every use: header, favicons, app icons, OG images.

export const INK = '#1a1a17';
export const PAPER = '#f4f1ea';

const VIEW = 24;
const STROKE = 2.16; // 0.09 × 24
const HALF = STROKE / 2;
/** Below this size only the outer square is drawn. */
export const MIN_DIVIDED = 12;

/** Inner SVG elements in a 24×24 viewBox, without the <svg> wrapper. */
export function logoShapes(size: number): string {
  const square = `<rect x="${HALF}" y="${HALF}" width="${VIEW - STROKE}" height="${VIEW - STROKE}"/>`;
  return size < MIN_DIVIDED ? square : `${square}<path d="M12 ${HALF}V12H${HALF}"/>`;
}

const strokeAttrs = (color: string) =>
  `fill="none" stroke="${color}" stroke-width="${STROKE}" stroke-linecap="square" stroke-linejoin="miter"`;

interface LogoOptions {
  /** Rendered size in px. Decides whether the divider is drawn. */
  size: number;
  /** Stroke color; defaults to currentColor so it follows the text. */
  color?: string;
  /** Extra attributes for the <svg> element. */
  attrs?: string;
}

/** A standalone inline SVG of the mark. */
export function logoSvg({ size, color = 'currentColor', attrs = '' }: LogoOptions): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="${size}" height="${size}" ${strokeAttrs(color)} ${attrs}>${logoShapes(size)}</svg>`;
}

/** The mark as a <g> placed at (x, y) and scaled to `size`, for composing into a larger SVG. */
export function logoGroup(x: number, y: number, size: number, color = INK): string {
  return `<g transform="translate(${x} ${y}) scale(${size / VIEW})" ${strokeAttrs(color)}>${logoShapes(size)}</g>`;
}

/**
 * The mark hinted to whole pixels, for small rasters (the favicon.ico sizes). The stroke
 * rounds to the whole pixel nearest 9% of the size; the divider is centered, and when a
 * pixel has to give, the upper-left quadrant is the one a pixel smaller, as browsers
 * render the reference CSS mark at 16 px.
 */
export function logoPixelSvg(size: number, color = INK): string {
  const s = Math.max(1, Math.round(size * 0.09));
  const d = Math.floor(size / 2 - s / 2);
  const rects = [
    [0, 0, size, s],
    [0, size - s, size, s],
    [0, 0, s, size],
    [size - s, 0, s, size],
    ...(size < MIN_DIVIDED ? [] : [[d, 0, s, d + s], [0, d, d + s, s]]),
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges" fill="${color}">${rects.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}</svg>`;
}

/** The browser-tab favicon: ink on light chrome, paper on dark chrome. */
export function faviconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" ${strokeAttrs(INK)}><style>@media (prefers-color-scheme: dark){svg{stroke:${PAPER}}}</style>${logoShapes(16)}</svg>`;
}

interface TileOptions {
  /** Tile size in px. */
  size: number;
  /** Tile color. MARK.md: white tile, or ink tile with a paper mark. */
  background: string;
  color: string;
  /** Corner radius as a fraction of the tile (the reference app icon is 14 px on 64). */
  radius?: number;
}

/** App icons and avatars: the mark at 50% of a square tile. */
export function tileSvg({ size, background, color, radius = 0 }: TileOptions): string {
  const r = radius * size;
  const mark = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="${background}"/>${logoGroup(size / 4, size / 4, mark, color)}</svg>`;
}
