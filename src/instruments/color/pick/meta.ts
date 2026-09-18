import { defineInstrument } from '@/lib/instrument';

export default defineInstrument({
  purpose: 'Choose a color by lightness, chroma and hue, and see how far each can go on screen.',
  primaryLabel: 'oklch',
  related: ['convert', 'scale', 'contrast'],
});
