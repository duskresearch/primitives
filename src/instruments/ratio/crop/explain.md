---
title: Inspect a focal crop
description: Fit or fill a reproducible composition in generic square, portrait, story or landscape frames.
---

## What it measures

Crop displays how much of a built-in composition remains visible inside an output frame. Fit preserves the whole source with empty space when ratios differ. Fill covers the frame and discards a source rectangle; the chosen focal point influences which region remains.

## How it is computed

The source is scaled by the smaller fit factor or larger fill factor. For fill, the focal point is brought toward the frame center and the offset is clamped so no empty edge appears. The same offset produces the visible source rectangle, visible-area percentage, SVG preview transform and CSS object-position. [CSS Images Level 3](https://www.w3.org/TR/css-images-3/#the-object-fit) defines `object-fit` and `object-position` behavior.

## When to use it

Use this for a generic crop estimate before preparing a real asset. These common ratios are not platform-safe-area guarantees and the built-in composition cannot predict a photograph’s important content. The URL records the source size, ratio, mode and focal location.

## Related

Aspect solves a new frame size. Proportion explores named relationships.
