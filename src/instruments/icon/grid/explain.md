---
title: Draw an icon grid
description: Copy an SVG exemplar with optional size and keyline guides.
---

## What it measures

The grid shows a square, circle or triangle in a chosen square viewBox. Padding is the inset between its drawing region and the viewBox edge. The guides make that inset visible; they are optional in the copied SVG.

## How it is computed

The exemplar is fitted inside the viewBox after the inset is subtracted. The output is a complete SVG, so its coordinate system and geometry travel together. An SVG [viewBox](https://www.w3.org/TR/SVG/coords.html#ViewBoxAttribute) maps those user coordinates to the displayed size.

## When to use it

Use the guides while comparing the alignment of a small icon family, then turn them off for a clean asset. These are built-in examples, not an editor for arbitrary paths.

## Related

Stroke compares weights at several display sizes. Optical applies a small manual correction to the same geometry.
