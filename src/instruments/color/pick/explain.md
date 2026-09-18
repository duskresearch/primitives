---
title: Color picker for hex, RGB, HSL and OKLCH
description: Choose a color by eye on a saturation and brightness square with a hue strip, or type the one you have, then copy it as hex, RGB, HSL or OKLCH.
---

## What it measures

A color picker. The square sets saturation (across) and brightness (up) at one hue, and the strip below it sets the hue. If you already have a color, type it instead: hex, rgb(), hsl(), oklch() or a name.

Choose the format you work in from the list beside the value: hex, RGB, HSL or OKLCH. The boxes follow it, the large value on the surface follows it, and C copies it. The same color in OKLCH sits above, for CSS you plan to adjust later.

Every point in the square is a color ordinary screens can show, so the color you pick is the color everyone sees. There is nothing to fall off: the square ends where the screen's colors end.

## How it is computed

The square and strip use Okhsv, a version of the familiar HSV model that Björn Ottosson published in 2021. It is built on his Oklab color space, the basis of oklch() in CSS Color 4.

HSV is a reshaping of RGB, quick to read, but its hues are unevenly spaced: green takes up a wide band of the strip while yellow and cyan flash past. Okhsv keeps HSV's shape, the same square with white at the top left, full color at the top right and black along the bottom, but spaces the hues by how different they look.

Like HSV, Okhsv covers exactly the colors sRGB can show, with no gaps and nothing beyond. The formats are one color written different ways. Hex, rgb() and hsl() are three spellings of its sRGB channels, and oklch() gives its lightness, chroma and hue in Oklab.

## When to use it

When you need a color and want to choose it by eye, or need to adjust one you were given. Drag across the square for how strong the color is, up and down for how light, and along the strip for its hue.

Choose the format by where you will paste it. Hex goes almost anywhere. RGB and HSL match what design tools show. OKLCH is the one for CSS you will build on, because its lightness means the same thing for every hue: two colors with the same L look equally light, which HSL's lightness does not promise.

From the keyboard, the square is two sliders, saturation then brightness, and the strip is a third, all stepped with the arrow keys. In the number boxes the arrow keys step the value, with Shift for ten steps.

## Related

Pick chooses one color. These instruments build on it.
