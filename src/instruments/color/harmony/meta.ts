import { defineInstrument } from '@/lib/instrument';

export default defineInstrument({
  purpose: 'Turn one color around the hue circle for the colors that sit with it.',
  primaryLabel: 'palette',
  related: ['scale', 'contrast', 'blend'],
});
