---
title: Build a repeating SVG tile
description: Repeat a circle, square or triangle with matched edges.
---

## What it measures

Tile places one geometric motif at the center of a square tile and repeats it across a larger frame. Tile pitch and motif size determine the clear gap. Rotation changes squares and triangles; rotating a circle leaves its appearance unchanged.

## How it is computed

The same motif geometry is copied into neighboring tile positions before clipping, so rotated shapes crossing a boundary meet their continuation. The result is a standalone SVG with a `pattern` definition using `patternUnits="userSpaceOnUse"`. [SVG 2 paint servers](https://www.w3.org/TR/SVG/pservers.html) define that pattern coordinate system and repeat behavior. Only canonical six-digit colors enter the markup.

## When to use it

Use a simple repeated motif when a compact vector asset is easier to scale than a raster. The pattern is deliberately limited to built-in shapes; it does not accept pasted SVG or arbitrary files.

## Related

Stripes makes CSS-only repeats. Export downloads the matching one-tile PNG or the repeating SVG.
