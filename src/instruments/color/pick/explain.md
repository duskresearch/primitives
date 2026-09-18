---
title: Color picker with hex, RGB, HSL and OKLCH
description: Pick a color by lightness, chroma and hue, or type the one you have as hex, rgb(), hsl() or a name, and copy it in the same format.
---

## What it measures

A color picker. Type the color you already have, as hex, rgb(), hsl(), oklch() or a name, or set it with three sliders: lightness (L, from black to white), chroma (C, how strong the color is, from gray upward) and hue (H, the angle around the color wheel, in degrees).

The field answers in the format you typed. Paste a hex and you get a hex back; paste rgb() and it stays rgb() as you move the sliders. The surface shows the color with that value, and oklch() beside it for CSS you will adjust later.

The plane shows lightness against chroma at the current hue. The painted area is every color an ordinary screen can show at that hue, in sRGB. The marker stops at its edge, so every color you pick looks the same on every screen. Where the edge falls changes a great deal with hue: yellow reaches high chroma only when it is light, blue only when it is dark.

## How it is computed

Hex, rgb() and hsl() are three ways of writing the same sRGB channels, so any of them can be read and written back without a change.

The sliders work in OKLCH, the polar form of Oklab, a color space published by Björn Ottosson in 2020 and added to CSS in Color Level 4. Oklab was fitted so that equal distances look like equal differences, which is why a step of 0.05 in L looks about the same anywhere on the scale. HSL's lightness makes no such promise.

To show a color, chroma and hue become Oklab's two color axes, then two fixed matrices with a cube between them lead to linear sRGB, which is gamma-encoded for the screen:

```
a = C × cos(H)
b = C × sin(H)
```

A color is inside sRGB when all three channels land between 0 and 1. The plane paints exactly those, and past the edge chroma is held at the most sRGB allows for that lightness and hue.

## When to use it

When you need a color, or need to adjust one you were given. Start from the hue, set lightness for the role the color plays (high for backgrounds, low for text), then chroma for how loud it should be.

The sliders are in OKLCH because steps of lightness stay even there, and two colors with the same L look equally light. HSL cannot promise that: it calls a yellow and a blue equally light at 50% when the yellow looks far lighter. You do not need to know OKLCH to use them; the field gives the result back as hex or whatever you typed.

Use the plane to see how much chroma a hue can hold. A strong color near the edge is as vivid as ordinary screens go; pulling it back a little leaves room for hover and pressed states to go further.

## Related

Pick chooses one color. These instruments build on it.
