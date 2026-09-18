import { defineInstrument } from '@/lib/instrument';

export default defineInstrument({
  purpose: 'Choose a color by eye, then copy it as hex, RGB, HSL or OKLCH.',
  primaryLabel: 'color',
  related: ['convert', 'scale', 'contrast'],
});
