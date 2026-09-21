---
title: Set padding and margin
description: Edit the four sides of a card and copy reduced CSS shorthands.
---

## What it measures

Inset separates padding inside a card’s border from margin outside it. Every top, right, bottom and left value is editable. Padding is nonnegative; signed margin supports overlap. The preview uses the exact CSS shorthands that are copied.

## How it is computed

Four equal sides reduce to one value. Equal top/bottom and left/right reduce to two. Equal left/right alone reduce to three; otherwise all four appear in clockwise order. The [CSS Box Model specification](https://www.w3.org/TR/css-box-3/) defines margin and padding, while the [CSS shorthand guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Shorthand_properties) explains one- through four-value physical-side order.

## When to use it

Use this when a card feels uneven and side values need to be considered together. Negative margins are allowed but can move the sample outside its containing region, so inspect the result in the actual page too.

## Related

Scale offers a shared spacing ramp. Tokens exports that ramp as CSS or configuration.
