---
title: Add seeded grain
description: Copy a complete SVG with its own reproducible noise filter.
---

## What it measures

Grain applies a repeatable noise field over a chosen background color. Seed changes the particular field, frequency changes its scale, and intensity changes the strength of the chosen foreground tint. The first render is deterministic.

## How it is computed

An SVG `feTurbulence` primitive creates a seeded fractal-noise field. A color matrix turns its luminance into alpha, then the chosen foreground is composited over the background. The copied output includes both the filter source and the rectangle referencing it; it never relies on a missing external `url(#id)`. The [SVG filter specification](https://www.w3.org/TR/SVG11/filters.html#feTurbulenceElement) defines `feTurbulence`, including its seed and octave controls.

## When to use it

Use this when a flat fill needs controlled texture with a URL that reproduces the recipe. SVG filter implementations may vary slightly across renderers, so inspect a production image if exact pixels matter.

## Related

Gradient applies seeded noise to a two-stop ramp. Texture offers grain, paper and cloud presets with local PNG export.
