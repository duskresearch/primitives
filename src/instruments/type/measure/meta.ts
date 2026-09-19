import { defineInstrument } from '@/lib/instrument';

export default defineInstrument({
  purpose: 'Drag a paragraph to the width that reads well, and take it away as max-width.',
  primaryLabel: 'max-width',
  related: ['scale', 'units', 'specimen'],
});
