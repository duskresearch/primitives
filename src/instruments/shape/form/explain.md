---
title: Clean parametric SVG shapes
description: Set a form, circumradius, and rotation in a 100 by 100 viewBox, then copy the SVG.
---

## What it measures

Form draws a circle, square, triangle, regular polygon, or star in a 100 × 100 coordinate system. Radius is the distance from the center to an outer vertex or circular edge, not the width of a bounding box. All shared settings travel in the URL even when a chosen form does not use them.

## How it is computed

Regular vertices are placed at equal angular intervals around (50, 50). Rotation adds degrees to the starting angle; the star inserts an inner vertex halfway between each outer pair. The result follows the [SVG Paths specification](https://www.w3.org/TR/svg-paths/) and uses one circle or one closed path in a standalone SVG. Numeric inputs are bounded so generated coordinates stay finite.

## When to use it

Copy the SVG when a simple icon or clipping source should not carry editor metadata. A star's inner ratio changes its notch depth. A circle keeps rotation in its URL, although turning a circle looks identical.

## Related

Polygon turns points into a CSS clip-path. Blob draws a seeded organic outline. Favicon packages this same mark as icon files.
