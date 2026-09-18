import { defineInstrument } from '@/lib/instrument';

export default defineInstrument({
  purpose: 'Paste a color in any CSS format and get it back in every other.',
  primaryLabel: 'result',
  related: ['pick', 'contrast', 'blend'],
});
