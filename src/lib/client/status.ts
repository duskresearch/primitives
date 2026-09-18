// The footer status slot: the only place feedback appears. No floating toasts.
import { motion } from '@/data/tokens.json';

let timer: ReturnType<typeof setTimeout> | undefined;

export function say(message: string, ms: number = motion.toast.copied) {
  const slots = () => document.querySelectorAll<HTMLElement>('[data-status]');
  slots().forEach((s) => (s.textContent = message));
  clearTimeout(timer);
  timer = setTimeout(() => slots().forEach((s) => (s.textContent = '')), ms);
}
