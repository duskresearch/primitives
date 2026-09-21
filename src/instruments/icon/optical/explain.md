---
title: Adjust optical size
description: Compare a nominal icon with a bounded manual correction.
---

## What it measures

The faint exemplar is the nominal geometry; the darker one includes your scale and X/Y offset. Applied scale is shown separately when the requested scale has to be clamped to the viewBox.

## How it is computed

The built-in geometry is transformed around the viewBox center, translated by the selected offsets, then bounded so its drawing region remains inside the viewBox. The export is a complete SVG with the applied transform. The [SVG viewBox model](https://www.w3.org/TR/SVG/coords.html#ViewBoxAttribute) controls how that geometry maps to display pixels.

## When to use it

Use it when a mathematically centered mark looks slightly too small or off-center beside other icons. Optical judgement remains yours; the controls do not infer a universal correction.

## Related

Grid exposes the nominal keylines. Stroke compares line weight across display sizes.
