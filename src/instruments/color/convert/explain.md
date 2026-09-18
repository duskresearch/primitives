---
title: Color converter for hex, rgb, hsl, oklch, oklab and Display P3
description: Paste a color in any CSS format and copy it back as hex, rgb(), hsl(), oklch(), oklab(), color(display-p3) or the nearest CSS color name.
---

## What it measures

Convert reads a color in any format CSS understands and writes it in every other: hex, rgb(), hsl(), oklch(), oklab(), color(display-p3 …) and the nearest of the 148 CSS named colors.

The formats describe one color in different coordinates. Hex, rgb() and hsl() are all sRGB, the color space of ordinary screens and of the web for most of its life. oklch() and oklab() describe how a color looks, and can reach colors beyond sRGB. color(display-p3) is the wider gamut that many phones and laptops can show.

Paste a value to start. The large value is the color as the format chosen beside it. Until you choose, it offers the other side of the likely conversion: oklch() for a hex or rgb(), hex for anything else. Every row in the panel copies itself. Hex works with or without the #, in three or six digits.

## How it is computed

Hex, rgb() and hsl() are three spellings of the same sRGB channels. Hex writes each channel as two hexadecimal digits from 00 to ff, rgb() as a number from 0 to 255, and hsl() reshapes the three into hue, saturation and lightness. Here all three come from the same 8-bit channels, so they always agree.

The other formats follow the conversions in CSS Color 4. The sRGB channels are linearized and taken into CIE XYZ, and from there into Oklab and its polar form OKLCH, or into Display P3, which shares sRGB's white point and transfer curve but has wider primaries.

A color outside sRGB cannot be written in hex, rgb() or hsl(). Those rows show the nearest color sRGB can show, found with the gamut mapping algorithm of CSS Color 4, and the panel says so. The P3 value is exact whenever the color fits in P3.

The name is the CSS color nearest in Oklab, marked as nearest unless it is the same color.

## When to use it

The design file says one thing and the code wants another: a hex from a design tool, oklch() in the stylesheet, hsl() in an older codebase. Paste whatever you have and copy what you need.

Write new CSS in oklch() when you plan to adjust colors later. Its lightness means what it says, and it can describe the wide-gamut colors current screens show. Keep hex where a tool or platform takes nothing else.

For a wide-gamut color with a fallback, write the hex first and the P3 value after. Browsers that understand the second declaration use it; older ones keep the first.

```
color: #ff0000;
color: color(display-p3 1 0 0);
```

Named colors suit sketches and teaching. In production, a name is only as precise as the color it happens to stand for.

## Related

Convert changes how a color is written. These instruments change the color.
