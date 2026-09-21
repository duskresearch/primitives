---
title: Export spacing tokens
description: Copy the shared scale as CSS variables, JSON or Tailwind CSS v3 configuration.
---

## What it measures

Tokens writes the current Space ramp in a chosen format. All values come from the same Scale operation, including its two-decimal pixel rounding. CSS uses custom properties, JSON uses a spacing object, and Tailwind output is shaped for the v3 JavaScript configuration.

## How it is computed

The ramp is generated once and mapped to names 1 through the selected step count. JSON is serialized as data, and the Tailwind CSS v3 target places those pairs under `theme.extend.spacing`. The [Tailwind CSS v3 documentation](https://v3.tailwindcss.com/docs/customizing-spacing) describes configuration spacing extensions; [CSS custom properties](https://www.w3.org/TR/css-variables-1/) define the CSS target. No Tailwind runtime is loaded in this instrument.

## When to use it

Use Tokens to move a chosen scale into an implementation without retyping values. Tailwind CSS v4 uses a different configuration model; choose CSS or JSON if that target is not v3.

## Related

Scale shows each token as a measured example. Inset applies specific padding and margin values to a card.
