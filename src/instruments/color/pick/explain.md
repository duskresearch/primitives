---
title: OKLCH color picker, by lightness, chroma and hue
description: Pick a color in OKLCH, see where the sRGB gamut ends at its hue, and copy it as oklch() or hex.
---

## What it measures

A color picker that works in OKLCH, the color space CSS Color 4 added for choosing colors the way eyes see them. You set three numbers: lightness (L, from 0 for black to 1 for white), chroma (C, how strong the color is, from 0 for gray upward) and hue (H, the angle around the color wheel, in degrees).

The plane shows lightness against chroma at the current hue. The painted area is every color an ordinary sRGB screen can show at that hue. The clear area beyond it holds colors that only wide-gamut screens can show, or none can. Where the edge falls changes a great deal with hue: yellow reaches high chroma only when it is light, blue only when it is dark.

The surface paints the color as chosen. You get it as oklch(), ready to paste into CSS, and as the hex an sRGB screen shows.

## How it is computed

OKLCH is the polar form of Oklab, a color space published by Björn Ottosson in 2020. Oklab was fitted so that equal distances look like equal differences, which is why a step of 0.05 in L looks about the same anywhere on the scale. HSL's lightness makes no such promise.

To show a color, chroma and hue become Oklab's two color axes, then two fixed matrices with a cube between them lead to linear sRGB, which is gamma-encoded for the screen:

```
a = C × cos(H)
b = C × sin(H)
```

A color is inside sRGB when all three channels land between 0 and 1. When it is not, its hex comes from the gamut mapping algorithm in CSS Color 4: chroma is lowered, keeping lightness and hue, until clipping the rest changes the color by less than a just noticeable difference.

## When to use it

When you need a color and would otherwise take a hex code from somewhere. Start from the hue, set lightness for the role the color plays (high for backgrounds, low for text), then chroma for how loud it should be.

Pick in OKLCH when you will build more colors from this one. Steps of lightness stay even, and two colors with the same L look equally light. HSL cannot promise that: it calls a yellow and a blue equally light at 50% when the yellow looks far lighter.

Use the plane to see how much chroma a hue can hold before sRGB screens clip it. For a brand color that must look the same everywhere, stay inside the painted area. Every current browser supports oklch(); on wide-gamut screens a color beyond sRGB shows as chosen, and elsewhere the browser maps it in.

## Related

Pick chooses one color. These instruments build on it.
