---
title: Make a CSS repeat
description: Copy complete CSS for stripes, dots or checks.
---

## What it measures

Stripes makes a repeated background from two selected colors. Stripe width controls the band, dot radius or check size; tile pitch controls the background-size. Angle affects the stripe mode only.

## How it is computed

Stripes use `repeating-linear-gradient()` over the element without a fixed image tile, avoiding diagonal seams. Dots use a radial gradient in each background tile, and checks use a four-quadrant conic gradient. The preview applies the exact CSS that is copied, including background color and size. [CSS Images Level 4](https://www.w3.org/TR/css-images-4/#gradients) defines the gradient image functions; [background-size](https://www.w3.org/TR/css-backgrounds-3/#the-background-size) sizes the dot and check tiles.

## When to use it

Use CSS when the repeat should follow an element without a separate asset. A wide band relative to tile pitch can look more like blocks than fine stripes; adjust both controls together.

## Related

Tile makes geometric SVG motifs. Export writes that shared tile motif as SVG and PNG, not this CSS gradient.
