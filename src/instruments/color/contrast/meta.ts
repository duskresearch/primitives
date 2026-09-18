import { defineInstrument } from '@/lib/instrument';

export default defineInstrument({
  purpose: 'Check that text can be read on its background. Adjust either side until it passes.',
  primaryLabel: 'ratio',
  related: ['pick', 'scale', 'convert'],
});
