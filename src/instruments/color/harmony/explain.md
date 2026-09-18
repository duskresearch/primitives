---
title: Color harmony in OKLCH, analogous to triadic
description: Build a palette from one color by turning its hue, analogous, complementary, split, triadic or square, at equal lightness and chroma in OKLCH.
---

## What it measures

Harmony finds the colors that sit well with one you already have, by turning its hue around the color wheel and keeping everything else. The rules are the classic ones: analogous (neighbors 30° and 60° either side), complementary (the opposite hue), split complementary (the two hues beside the opposite), triadic (three hues 120° apart) and square (four hues 90° apart).

The difference is the wheel. The hues turn in OKLCH, so every color in the palette keeps the perceived lightness and chroma of your base. On a wheel built from HSL, the same rules give a yellow that glows beside a blue that sinks.

The result is the palette as swatches, each of which copies its hex, and as a list of oklch() values.

## How it is computed

Each rule is a list of angles added to the base hue, H. Lightness and chroma are copied unchanged, and angles wrap at 360°.

```
analogous       H − 60, H − 30, H, H + 30, H + 60
complementary   H, H + 180
split           H, H + 150, H + 210
triadic         H, H + 120, H + 240
square          H, H + 90, H + 180, H + 270
```

Hues differ in how much chroma they can hold at a given lightness. At the lightness of a strong red, a blue reaches the edge of sRGB sooner. A color that falls outside it is brought in by lowering its chroma to the most that fits, keeping lightness and hue exactly, so the palette stays level in lightness even where it cannot stay as strong. The oklch() values you copy are those fitted colors, the same ones the swatches show.

The base is the first color of every rule except analogous, where it sits in the middle with its neighbors on either side. A gray has no hue to turn. Give the base some chroma first.

## When to use it

You have one brand color and need four more. Analogous gives calm, related colors, such as chart series or illustration fills. Complementary gives the strongest contrast of hue: one accent against a field of the base. Split and triadic give variety with less clash than a straight complement. Square gives four evenly spaced colors for categories, and triadic or square can start a data palette where each series needs a hue of its own.

Equal lightness is both the point and the limit. It keeps a palette balanced, with no color shouting over the others, but it also means the colors have nearly the same contrast against any background, and too little against each other to carry text. Make lighter and darker versions of each with Scale, and check the pairs you actually set with Contrast.

## Related

Harmony chooses hues. These instruments give each one a range and check it.
