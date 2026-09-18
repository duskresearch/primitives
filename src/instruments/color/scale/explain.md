---
title: Tints and shades in OKLCH, seven even steps as CSS
description: Make seven even tints and shades from one color in OKLCH, with your color kept exactly, and copy them as CSS custom properties.
---

## What it measures

A scale is one color stepped from light to dark: the tints and shades a design system names 100 to 700. This one keeps the hue and chroma of your base color and changes only its lightness, in seven steps.

The steps look even because they are even in OKLCH lightness, 0.1 apart. The base color sits exactly on one of the steps, as near the middle as the range allows, so the color you started with appears in the scale unchanged. Because OKLCH holds hue steady as lightness changes, a blue scale stays blue at its light end instead of drifting toward purple, a common flaw of scales made in HSL or CIELAB.

The result is seven swatches, each of which copies its hex, and the whole scale as CSS custom properties, from --color-100 to --color-700.

## How it is computed

Take the base color in OKLCH. Each step's lightness is the base's plus or minus a multiple of 0.1, with the base on step k:

```
L(i) = L(base) + 0.1 × (k − i)
i = 0 … 6, lightest first
```

k is chosen so the base lands as near the middle as it can while the ladder stays between lightness 0.2 and 0.98; a base lighter or darker than that stretches the range. Hue and chroma are copied unchanged.

Very light and very dark colors cannot hold much chroma in sRGB. A step that falls outside it is brought in by lowering its chroma to the most that fits, keeping lightness and hue exactly. The steps remain evenly spaced and the same hue, which is why the ends of a scale look calmer than its middle.

Every step is brought inside sRGB this way, so the swatches, the hex values and the CSS describe the same colors. A base color beyond sRGB is brought in too.

## When to use it

Your grays and tints look uneven because they were made in HSL. HSL's lightness is a formula over the RGB channels, not a measure of how light a color looks, so evenly spaced HSL steps bunch together in some hues and jump in others, and a blue at 50% looks much darker than a yellow at 50%.

Use Scale when you set up color tokens: backgrounds and borders from the light end, text and pressed states from the dark end, the base for fills and links. Because every step is the same distance apart in perceived lightness, scales built from different hues line up. Step 300 of a red and step 300 of a blue look equally light, so one can stand in for the other.

Check text on a background with Contrast before you settle on a pair. The step numbers are a guide; the ratio decides.

## Related

Scale steps one color through lightness. These instruments choose the color and check the pairs.
