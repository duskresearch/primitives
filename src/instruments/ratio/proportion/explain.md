---
title: Apply a named proportion
description: Compare symbolic ratios with their rounded frame dimensions.
---

## What it measures

Proportion applies a selected relationship to a source frame. Golden, root-two and root-three ratios are irrational; square, 3:2 and 4:3 are rational. One source dimension remains fixed while the other becomes an integer pixel measurement.

## How it is computed

The symbolic relationship is kept separate from the rounded result. For a retained width, height is width divided by the relationship’s numerical value; for a retained height, width is height multiplied by it. The computed dimension rounds to the nearest pixel. The [CSS Sizing specification](https://www.w3.org/TR/css-sizing-4/#aspect-ratio) describes how CSS can preserve a preferred ratio in responsive layout.

## When to use it

Use a named ratio to explore a composition, not as a claim that one proportion is universally preferable. Compare the exact label with the actual decimal that follows pixel rounding, especially at small sizes.

## Related

Aspect reduces existing dimensions and solves a chosen target ratio. Crop places a fixed composition inside a target frame.
