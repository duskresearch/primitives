---
title: Shuffle a list reproducibly
description: Rearrange up to 100 nonblank lines while preserving duplicates.
---

## What it measures

Shuffle returns the input’s nonblank lines in a new order. Duplicate lines remain separate entries and Unicode text is preserved. Blank lines are ignored, including lines containing only whitespace.

## How it is computed

The Fisher–Yates procedure visits the list backward, exchanging each position with a uniformly mapped earlier position. It uses the same seeded Mulberry32 stream and unbiased inclusive mapping as Range. It never sorts with a random comparator. The result and original list travel in the URL; the input is capped at 4096 characters and 100 nonblank lines.

## When to use it

Use this for a reproducible order in examples, exercises or interface tests. A long list produces a long shared link. Seeded order is predictable and should not be used for secret or adversarial selection.

## Related

Seed makes the source sequence visible. Range and Dice map the same generator to numbers.
