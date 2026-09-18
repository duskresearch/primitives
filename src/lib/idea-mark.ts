// A mark for an idea that is not a primitive yet: one shape from a small vocabulary on an
// off-palette tint, both chosen by the idea's id, so the same idea always looks the same.
// Chroma stays low (0.04 tint, 0.1 shape) so these never pass for the primitives' own
// marks, which sit at 0.18.
import type { MarkLayer } from './catalogue';

function seeded(text: string) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const shapes: ((c: string) => MarkLayer[])[] = [
  (c) => [{ w: '.66em', h: '.66em', bg: c, r: '50%' }],
  (c) => [{ w: '.56em', h: '.56em', bg: c }],
  (c) => [{ w: '.78em', h: '.68em', bg: c, cp: 'polygon(50% 0,100% 100%,0 100%)' }],
  (c) => [{ w: '.46em', h: '.46em', bd: '.1em solid', bc: c, r: '50%' }],
  (c) => [{ w: '.76em', h: '.38em', bg: c, r: '.38em .38em 0 0', tf: 'translateY(-.08em)' }],
  (c) => [{ w: '.68em', h: '.68em', bg: c, cp: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }],
  (c) => [{ w: '.16em', h: '.66em', bg: c, tf: 'translateX(-.15em)' }, { w: '.16em', h: '.66em', bg: c, tf: 'translateX(.15em)' }],
  (c) => [{ w: '.76em', h: '.32em', bg: c, r: '.16em' }],
  (c) => [-1, 1].flatMap((x) => [-1, 1].map((y) => ({ w: '.2em', h: '.2em', bg: c, r: '50%', tf: `translate(${x * 0.17}em,${y * 0.17}em)` }))),
  (c) => [{ w: '.66em', h: '.14em', bg: c }, { w: '.14em', h: '.66em', bg: c }],
  (c) => [{ w: '.62em', h: '.62em', bg: c, cp: 'polygon(0 0,100% 0,0 100%)' }],
  (c) => [{ w: '.66em', h: '.66em', bg: `repeating-linear-gradient(90deg, ${c} 0 .08em, transparent .08em .18em)` }],
];

export function ideaMark(id: string): { tint: string; layers: MarkLayer[] } {
  const next = seeded(id);
  const hue = Math.round(next() * 360);
  const ink = (hue + 120 + Math.round(next() * 120)) % 360;
  const shape = shapes[Math.floor(next() * shapes.length)];
  return { tint: `oklch(0.9 0.04 ${hue})`, layers: shape(`oklch(0.52 0.1 ${ink})`) };
}
