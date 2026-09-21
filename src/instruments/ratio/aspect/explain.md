---
title: Solve an aspect ratio
description: Simplify current dimensions and calculate a target frame from a desired ratio.
---

## What it measures

Aspect reduces the current width and height to the smallest integer pair and reports their exact quotient. A second ratio describes a target frame. Keeping either the current width or height solves its missing partner.

## How it is computed

The greatest common divisor reduces both integer pairs. The missing target dimension is multiplied or divided by the target ratio and rounded to the nearest whole pixel. The CSS output uses the simplified target as an `aspect-ratio` declaration. The [CSS Sizing Level 4 specification](https://www.w3.org/TR/css-sizing-4/#aspect-ratio) defines how preferred aspect ratios participate in layout.

## When to use it

Use this when a source frame has to fit a different proportion while preserving one known dimension. The solved integer dimensions may differ slightly from the exact target ratio because pixels are whole numbers; the symbolic CSS ratio stays exact.

## Related

Proportion applies named relationships. Crop shows how a source composition fits or fills a target aspect.
