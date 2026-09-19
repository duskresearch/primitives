// The confirmation at the point of a copy: a small ink chip that rises and fades just above
// where the value was clicked. Decorative; the footer status slot says the same for screen
// readers. With reduced motion, animation is off site-wide and the chip simply comes and goes.
import { motion } from '@/data/tokens.json';

const GAP = 10;
const EDGE = 8;

export function stamp(text: string, x: number, y: number) {
  const chip = Object.assign(document.createElement('span'), { className: 'stamp', textContent: text });
  chip.setAttribute('aria-hidden', 'true');
  document.body.append(chip);
  const { width, height } = chip.getBoundingClientRect();
  chip.style.left = `${Math.min(Math.max(EDGE, x - width / 2), innerWidth - width - EDGE)}px`;
  chip.style.top = `${Math.max(EDGE, y - height - GAP)}px`;
  setTimeout(() => chip.remove(), motion.stamp.duration);
}

/** Above the middle of an element, for copies made from the keyboard. */
export function stampAbove(text: string, el: Element) {
  const r = el.getBoundingClientRect();
  stamp(text, r.left + r.width / 2, r.top);
}
