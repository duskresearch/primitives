---
title: Make a noisy gradient
description: Copy CSS that embeds a seeded SVG gradient and noise overlay.
---

## What it measures

Gradient combines two chosen colors in an sRGB ramp and overlays a controlled seeded noise field. The preview applies the complete copied CSS, which embeds the SVG as a data URL. A separate smooth CSS gradient is explicitly labeled as a fallback without noise.

## How it is computed

SVG `linearGradient` positions two stops at the selected CSS-style angle. The same filter model as Grain adds a tinted `feTurbulence` field. The source declares sRGB interpolation explicitly. [SVG filter effects](https://www.w3.org/TR/SVG11/filters.html#feTurbulenceElement) define the seeded noise primitive, and [SVG gradients](https://www.w3.org/TR/SVG/pservers.html) define stop interpolation and direction. This is a noise overlay, not a claim of a specific display’s dithering algorithm.

## When to use it

Use it to soften visible bands in a large gradient while keeping the recipe reproducible. The data URL is longer than ordinary gradient CSS, and browser SVG-filter rendering can differ.

## Related

Grain isolates the noise layer. Texture provides larger procedural fields and image export.
