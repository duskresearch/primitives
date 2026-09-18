---
title: Blend two colors with color-mix(), opacity and blend modes
description: See what two colors make together with color-mix() in OKLCH, opacity, multiply, screen or overlay, and copy the result and the CSS that makes it.
---

## What it measures

Blend shows the color two colors make when they meet. A is the top color and B the one underneath. Mix gives what CSS color-mix() makes in OKLCH. Opacity lays A over B partly transparent, the way a browser composites it. Multiply, screen and overlay are the blend modes of CSS mix-blend-mode and of most design tools.

Amount is how much of A: its share of a mix, or its opacity for everything else. For mix and opacity, two strips run from A to B, one in OKLCH and one in sRGB, with the space in use marked. The gap between them is where muddy mixes come from.

The result is a color you can copy, written in the top color's format, and the CSS that produces it, with each color written in its own.

## How it is computed

Mix follows CSS Color 5. color-mix(in oklch, A p%, B) moves in a straight line through lightness, chroma and hue, taking the shorter way around the hue wheel. A gray has no hue, so it takes the other color's, as the specification requires.

Opacity follows W3C Compositing and Blending. Browsers composite in sRGB, so each channel of the result is a weighted average of the two, the same color that color-mix(in srgb, A p%, B) gives:

```
result = (1 − α) × B + α × A
```

The blend modes use the formulas of the same specification, on each sRGB channel from 0 to 1, with B as the backdrop:

```
multiply   B × A
screen     B + A − B × A
overlay    B ≤ 0.5 ? 2 × B × A : 1 − 2 × (1 − B) × (1 − A)
```

Below 100%, the blended layer is composited at that opacity, the way an element with both mix-blend-mode and opacity is drawn.

## When to use it

Overlays and multiplies come out muddy because sRGB mixes pass through gray. Red and green meet in olive, blue and yellow in plain gray. Compare the strips: in OKLCH the middle keeps its chroma. Use color-mix(in oklch, …) for hover states, tints of a brand color, and the colors between two ends of a chart.

Use opacity when a layer really is transparent, like a scrim over a photo or a selection highlight, and you need the flat color it produces, for example to check its contrast. Multiply darkens and suits shadows and textures on light grounds. Screen lightens and suits glows on dark ones. Overlay raises contrast, darkening the darks and lightening the lights. Some things never change: multiplying by white or screening with black leaves a color as it was.

## Related

Blend makes a new color from two. These instruments check it and write it down.
