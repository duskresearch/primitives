---
title: Roll a set of dice
description: See every seeded die result and the total it actually produces.
---

## What it measures

Dice rolls the selected number of dice with a shared side count. The large total is the sum of the displayed rolls, not a separately generated number. Minimum and maximum possible totals follow directly from count and sides.

## How it is computed

Each die draws an inclusive integer from 1 to its side count using the same rejection-sampling mapper as Range. Draws advance one Mulberry32 stream in order. The count is limited to 100 and sides to 1000, so a shareable URL remains small. [Crypto.getRandomValues()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) is used only to choose a new seed when requested, not to produce each roll.

## When to use it

Use the rolls when a repeatable simulation or example matters. A shared seed intentionally makes the result predictable; do not treat it as a secure wager or auditable external drawing.

## Related

Range provides one bounded draw. Seed shows the underlying sequence. Shuffle applies it to list order.
