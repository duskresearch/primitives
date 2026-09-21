---
title: CSS clip-path polygon editor
description: Start from a preset, edit each point in percentages, and copy the CSS declaration.
---

## What it measures

Polygon is an ordered list of three to twelve points, each expressed as X and Y percentages of the element's reference box. The preview uses the exported clip-path with the chosen foreground as its background color. Points may cross; a star or edited outline need not be convex.

## How it is computed

The initial preset uses regular vertices in the shared 100 × 100 shape coordinates. A star needs two vertices per tip, so its preset uses at most six tips within the twelve-vertex limit; the shared side count remains unchanged for other instruments. Explicit points in the URL take precedence over those preset vertices. The [CSS Shapes Level 1 `polygon()` definition](https://www.w3.org/TR/css-shapes-1/#funcdef-basic-shape-polygon) maps each point to a percentage of the reference box. This declaration uses the default nonzero fill rule.

## When to use it

Apply the declaration to an element whose clipping outline should follow its size. The primary clip-path copy contains geometry only; the secondary colored CSS also includes the chosen background color. Add or remove points to change the contour, then edit the two coordinates numerically. Verify any self-intersection against the intended fill, particularly for a star.

## Related

Form gives standalone SVG. Corner treats a curved rectangular edge. Blob draws a seeded smooth outline rather than straight polygon edges.
