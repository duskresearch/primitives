---
title: Compare icon strokes
description: Copy scaling and non-scaling SVG strokes from one 24px viewBox.
---

## What it measures

This comparison renders the same exemplar at five display sizes. One SVG scales its stroke with the geometry; the other keeps the stroke width fixed in display pixels.

## How it is computed

Both exports use a 24 × 24 viewBox. The fixed version applies [`vector-effect: non-scaling-stroke`](https://www.w3.org/TR/SVG2/painting.html#VectorEffectProperty) to the path. That changes stroke painting without changing the path coordinates.

## When to use it

Use a scaling stroke when an icon should grow proportionally. Use a non-scaling stroke when several display sizes should retain the same apparent line width. Verify the result at its intended rendered sizes.

## Related

Grid shows the keylines. Optical adjusts the same exemplar's visual position and scale.
