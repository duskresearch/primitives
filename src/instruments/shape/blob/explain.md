---
title: Seeded organic SVG blob
description: Set a seed, point count, variation, radius, and rotation to produce a repeatable closed path.
---

## What it measures

Blob draws a closed organic contour from three to twelve radial control points. Its seed is part of the URL, so the same setup produces the same shape. A zero irregularity setting gives equal-radius knots rather than random variation.

## How it is computed

Mulberry32 is a named seeded 32-bit pseudorandom generator. Each knot receives a bounded reduction from the shared circumradius. Midpoints between neighbors become quadratic Bézier endpoints, with the knots as controls. This keeps every segment within neighboring points' convex hull and the 100 × 100 viewBox. The `Q` and close commands follow the [SVG Paths specification](https://www.w3.org/TR/svg-paths/#PathDataQuadraticBezierCommands).

## When to use it

Copy the colorless path data into an existing SVG or the standalone SVG with the chosen foreground for a new asset. New seed advances to another explicit integer before drawing; it never relies on unrecorded random state. Verify the result at its intended display size.

## Related

Form provides regular geometry. Polygon gives straight clip-path edges. Corner compares rounded and superellipse-based rectangular outlines.
