---
title: Build a spacing ramp
description: Compare linear and modular spacing steps with pixel and rem values.
---

## What it measures

Scale creates a finite list of spacing values from a base size. Linear mode uses whole base multiples; modular mode multiplies by a ratio. Each example bar uses its listed pixel width, capped visually by the available surface width, and each row shows a rem equivalent.

## How it is computed

Linear step n is base × n. Modular step n is base × ratio to the power n−1. Pixels round to two decimals; rem is calculated from that displayed pixel value and the selected root size, then rounds to four decimals. The CSS output is a set of custom properties. The [CSS Custom Properties specification](https://www.w3.org/TR/css-variables-1/) defines these reusable declarations.

## When to use it

Use a ramp when arbitrary one-off spacing values make a layout hard to maintain. A linear sequence is easy to reason about; a modular one grows faster. Large settings may exceed the preview width, but copied CSS retains the full value.

## Related

Inset applies padding and margin to one card. Tokens exports this exact ramp to other formats.
