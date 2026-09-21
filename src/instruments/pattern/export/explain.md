---
title: Export a matching pattern tile
description: Copy a repeating SVG or download its SVG and one-tile PNG counterpart.
---

## What it measures

Export uses the current shared motif, pitch and colors plus the tile size and rotation controls. The primary Copy action returns the complete repeating SVG. Separate buttons download that SVG or one square PNG tile with an explicit filename.

## How it is computed

The repeat SVG and the one-tile SVG share one motif geometry, including neighboring copies for seam continuity. PNG export loads the one-tile SVG into an image, draws it once to a bounded canvas, and encodes one PNG locally with [HTML canvas `toBlob()`](https://html.spec.whatwg.org/multipage/canvas.html#dom-canvas-toblob-dev). Object URLs are revoked after use. The PNG edge is at most 256 pixels under the shared tile-size limit, below the adapter’s 1024-pixel safety cap.

## When to use it

Use SVG when scale independence matters, or the PNG tile when a raster repeat is required. Browser SVG rasterization can vary slightly in antialiasing; the geometry and colors are the same model.

## Related

Tile edits the motif. Stripes creates separate CSS gradient patterns and is not this SVG export source.
