---
title: Font fallback generator with size-adjust and ascent-override
description: Fit a system font to your webfont with size-adjust and ascent, descent and line gap overrides, so text does not jump when the webfont loads.
---

## What it measures

Before a webfont arrives, the browser shows text in a font already on the device, the fallback. When the webfont loads, every line reflows to new widths and heights, and the page jumps. Fallback measures how different the two faces are and gives you the CSS that makes the fallback take up the same space.

The surface overlays both, the webfont in ink and the fallback in red. As it comes, the lines part; adjusted, they nearly coincide, and the jump is gone. The preview uses your sample text, set at the same size in both fonts. It works for any Google Fonts family and the fallbacks visitors are likely to have: pick the face and the fallback, check the overlay, then copy the rule.

## How it is computed

CSS Fonts Level 5 lets an @font-face rule scale a local font and override its vertical metrics. The fallback is scaled so its average character width matches the webfont's, then given the webfont's ascent, descent and line gap, divided by that scale:

```
size-adjust     = webfont width / fallback width
ascent-override = webfont ascent / size-adjust
```

Descent and line gap follow the same way, all as percentages of the em. The measurements come from Capsize, which publishes them for every Google Fonts family and for common system fonts, and the method is the one Capsize and Next.js use. Width decides where lines break, which is why it is matched first; the vertical overrides then keep each line the same height, so paragraphs end on the same line. The values are percentages the browser applies to the local font at any size.

## When to use it

Text jumps when the webfont arrives. The jump counts toward Cumulative Layout Shift, one of Google's Core Web Vitals, and it moves words under a reader's eyes. Add the @font-face to your CSS and name the fallback second in your font-family, right after the webfont.

Choose a fallback every visitor has: Arial or Helvetica for sans serif faces, Times New Roman or Georgia for serifs, Courier New for monospace. The preview needs that font installed on your own device; a missing one shows the browser's default font instead. Browsers that do not support the overrides ignore them and fall back as before. Use font-display: swap on the webfont, so text shows at once in the fallback; with the fallback fitted, the swap is barely visible.

## Related

Fallback fits a system font to a face. These instruments help choose the face.
