---
title: Build elevation levels
description: Use one shadow model to create a consistent CSS token ladder.
---

## What it measures

Elevation returns three to eight named shadow levels. Every level shares light angle, softness, shadow color and opacity. Only its lift changes in equal steps, so the ladder can be tuned as one system.

## How it is computed

Each level calls the same layered shadow operation as Shadow with three layers and an increasing lift. The resulting declarations are written as CSS custom properties. [CSS Custom Properties Level 1](https://www.w3.org/TR/css-variables-1/) defines those reusable values; [CSS box-shadow](https://www.w3.org/TR/css-backgrounds-3/#box-shadow) defines the underlying visual effect.

## When to use it

Use a small ladder when several related surfaces need distinguishable depth. A level name is a design token, not a physical measurement or a guarantee of hierarchy on every background.

## Related

Shadow gives direct control over one effect. Blur tests transparency over a fixed specimen.
