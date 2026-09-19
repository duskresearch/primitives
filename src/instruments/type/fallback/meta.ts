import { defineInstrument } from '@/lib/instrument';

export default defineInstrument({
  purpose: 'Fit a system font to your webfont, so text does not jump when the webfont arrives.',
  primaryLabel: '@font-face',
  related: ['specimen', 'scale', 'measure'],
});
