---
title: Estimate motion duration
description: Use travel and element size to choose a bounded animation time.
---

## What it measures

Duration returns a millisecond recommendation for one movement. Distance is entered in CSS pixels, and the size choice adjusts the result. Playback uses the chosen shared curve, so the comparison changes time without changing the curve itself.

## How it is computed

The local design heuristic is 140 + 9 × √distance milliseconds. Small and large elements multiply it by 0.88 and 1.15 respectively. The result is rounded to five milliseconds and clamped to 100–800 milliseconds. This is a design aid, not an official formula or accessibility guarantee. The [CSS Transitions specification](https://www.w3.org/TR/css-transitions-1/) defines duration as the time to complete a transition.

## When to use it

Use this when a single default duration makes a short movement sluggish or a long movement sudden. Try the value in the real interface, where context, distance, visual weight and user preference can change what works.

## Related

Ease compares timing curves. Spring models physical settling. Stagger gives each list item a start time.
