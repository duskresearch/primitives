---
title: Set list entry delays
description: Choose list count, interval and entry order, then copy exact start times.
---

## What it measures

Stagger assigns a start delay to each item of a list. Start, end and center order change which item begins first; the output stays in item order for direct application to the list. Total time includes the last delay and one item duration.

## How it is computed

Items are ranked by the chosen entry order. Rank multiplied by interval gives the start delay. A CSS animation-delay rule is generated for each item using nth-child. [CSS Animations Level 1](https://www.w3.org/TR/css-animations-1/) defines animation-delay as the time before an animation begins. The preview reads the same delay array as the copied output.

## When to use it

Use a short stagger when sequence helps explain how a list arrives. A long interval makes a large list slow, so inspect the total time as well as the first few entries. The preview runs only when Play is pressed.

## Related

Duration estimates each item’s movement time. Ease chooses the timing curve for each animation. Export writes the shared curve for CSS or application code.
