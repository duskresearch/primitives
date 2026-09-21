import { defineInstrument } from '@/lib/instrument';

export default defineInstrument({
  purpose: 'Set the widths where a column grid changes, then test each range against the CSS you can copy.',
  primaryLabel: 'media query set',
  related: ['columns', 'layout', 'baseline'],
});
