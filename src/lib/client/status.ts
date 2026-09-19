// The footer status slot, where feedback is announced (a live region). Copies also get a
// stamp where they were clicked (stamp.ts); nothing else floats.
import { motion } from '@/data/tokens.json';

let timer: ReturnType<typeof setTimeout> | undefined;

export function say(message: string, ms: number = motion.toast.copied) {
  const slots = () => document.querySelectorAll<HTMLElement>('[data-status]');
  slots().forEach((s) => (s.textContent = message));
  clearTimeout(timer);
  timer = setTimeout(() => slots().forEach((s) => (s.textContent = '')), ms);
}
