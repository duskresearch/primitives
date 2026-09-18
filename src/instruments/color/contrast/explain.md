---
title: Contrast checker for text and background colors (WCAG 2.2)
description: Check whether text can be read on its background. WCAG 2.2 contrast ratio with AA and AAA grades, OKLCH sliders, and a fix that keeps your hue.
---

## What it measures

Contrast is the difference in brightness between two colors, written as a ratio. 1 : 1 is the same color twice. 21 : 1 is black on white, the widest gap a screen can show. Hue barely matters: a red and a green of equal brightness have almost no contrast at all, which is why a pairing can look vivid and still be hard to read.

The ratio here is the one defined by the Web Content Accessibility Guidelines (WCAG) 2.2, the standard that most accessibility laws and audits refer to. It compares the text color with the background directly behind it. It does not account for font weight, size or rendering, so thin type at small sizes can read worse than its ratio suggests.

As you move either color, the tool shows the ratio, the grade it earns, and, when it falls short, the nearest text color with the same hue and chroma that passes.

## How it is computed

Each color is turned into relative luminance: how bright it looks to the eye, from 0 for black to 1 for white. The stored sRGB channels are gamma-encoded, so they are first linearized, then weighted by the eye's sensitivity to each. Green counts most, blue least.

```
c ≤ 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ^ 2.4
L = 0.2126 R + 0.7152 G + 0.0722 B
```

The ratio is the brighter luminance plus 0.05 over the darker plus 0.05. The 0.05 stands for the glow of a screen in a lit room, and it keeps the ratio finite when one color is pure black.

```
(L1 + 0.05) / (L2 + 0.05)
```

The sliders work in OKLCH, where L is perceived lightness, so each step changes brightness by an even amount. Colors outside sRGB are mapped into it before measuring, keeping lightness and hue. The ratio is rounded down, never up, so 4.499 shows as 4.49 and fails.

## When to use it

Body text needs 4.5 : 1 to meet level AA (WCAG 2.2, success criterion 1.4.3) and 7 : 1 for AAA (1.4.6). Large text, 24 px and up or 18.66 px bold and up, may drop to 3 : 1 for AA and 4.5 : 1 for AAA. Icons, input borders and focus indicators need 3 : 1 against what surrounds them (1.4.11). Logos, disabled controls and purely decorative text have no requirement.

Check contrast when you choose a gray for secondary text, set text on a brand color, or style placeholder text in a form. Placeholder text is text, and it usually fails.

Most failures are gray text on white. Darkening the text by one or two steps almost always fixes it; the suggestion in the panel does exactly that while keeping your hue and chroma. When the text is lighter than its background, the suggestion lightens it instead.

A passing ratio is a floor, not a target. Long reading is easier well above 4.5 : 1.

## Related

Contrast checks a pair you already have. These instruments help you choose the pair.
