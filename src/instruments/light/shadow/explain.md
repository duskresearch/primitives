---
title: Build a layered shadow
description: Tune a box-shadow with angle, softness, lift and opacity.
---

## What it measures

Shadow constructs an artistic group of shadows beneath a card. Angle points toward the implied light source; offsets go the opposite way. Lift controls distance, softness controls blur, and opacity is spread across layers.

## How it is computed

Each layer receives a fraction of the chosen lift. Cosine and sine of the opposite angle produce horizontal and vertical offsets. Blur grows with distance and softness, while opacity decreases for later layers. The preview uses exactly the generated CSS. [CSS Backgrounds and Borders Level 3](https://www.w3.org/TR/css-backgrounds-3/#box-shadow) defines comma-separated box shadows and their offset and blur fields.

## When to use it

Use a layered shadow to make related surfaces share a visual direction. This is not a simulation of physical illumination; adjust it against the surrounding layout and chosen colors.

## Related

Elevation repeats this model at several depths. Blur explores a translucent panel over a fixed backdrop.
