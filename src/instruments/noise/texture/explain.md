---
title: Export a procedural texture
description: Make grain, paper or clouds as a seeded SVG and a local PNG.
---

## What it measures

Texture offers three bounded recipes over chosen colors. Each preset sets the frequency and octave count of a seeded SVG noise field. The primary output is the complete SVG; separate buttons download SVG or one PNG at the selected edge size.

## How it is computed

The same SVG string feeds preview and the PNG adapter. The adapter loads that SVG once into a canvas, draws one square image and encodes PNG locally using [canvas `toBlob()`](https://html.spec.whatwg.org/multipage/canvas.html#dom-canvas-toblob-dev). Output is capped at 1024 × 1024 pixels. [SVG `feTurbulence`](https://www.w3.org/TR/SVG11/filters.html#feTurbulenceElement) supplies the procedural field; the seed, colors and intensity travel in the URL.

## When to use it

Use a built-in texture when a reproducible nonphotographic surface will do. Browser filter and rasterization differences can change individual pixels. No image is uploaded and no AI-generated or arbitrary file input is accepted.

## Related

Grain tunes one frequency directly. Gradient applies controlled noise to a two-stop ramp.
