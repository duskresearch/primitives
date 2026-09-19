import { defineInstrument } from '@/lib/instrument';

export default defineInstrument({
  purpose: 'Convert a length between px, rem, em, pt and %, and tracking from design tools into letter-spacing.',
  primaryLabel: 'converted value',
  related: ['scale', 'measure', 'color/convert'],
});
