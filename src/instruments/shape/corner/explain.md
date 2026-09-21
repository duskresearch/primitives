---
title: Superellipse corners and rounded rectangles
description: Compare a round corner with a sampled superellipse and copy its closed path or progressive CSS.
---

## What it measures

Corner compares a regular rounded square with a superellipse-based square at the same corner radius. Its corner radius is separate from the shared shape circumradius. A smoothing value of zero is round; one reaches the traditional squircle exponent.

## How it is computed

The curve follows the [CSS Borders Level 4 superellipse definition](https://drafts.csswg.org/css-borders-4/#corner-shaping): x raised to 2^K plus y raised to 2^K equals one. K runs from 1 to 2. The SVG path samples each quarter curve into straight segments and closes it. The draft CSS `corner-shape: superellipse(K)` expresses the mathematical model with the same corner radius, but is only progressive CSS, subject to browser support.

## When to use it

Use the SVG path where the curve must render consistently. Raw path data describes geometry only; the standalone SVG includes the chosen foreground. The CSS declaration is useful when supporting browsers implement corner-shape; keep a regular border-radius fallback. This model is not an exact reconstruction of Apple's or Figma's proprietary corner algorithm.

## Related

Form draws basic shapes. Polygon exports straight-edged clipping. Blob uses a seeded smooth path.
