---
title: Draw an inclusive integer
description: Generate one reproducible integer with unbiased mapping into chosen bounds.
---

## What it measures

Range gives one integer from the lower through upper endpoint, including both. The seed is shared with the other seeded Random instruments. Changing either bound or seed updates the output deterministically.

## How it is computed

Mulberry32 produces a uint32 candidate. The mapper rejects candidates above the largest multiple of the interval size that fits in 2³², then takes the remainder and adds the lower bound. This avoids the small bias caused by applying modulo to the full 32-bit range. The browser [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) supplies entropy only when New seed is pressed.

## When to use it

Use a shareable range result for reproducible mock data or a repeatable choice. This seeded generator is not suitable for cryptographic or adversarial draws.

## Related

Seed shows the raw uint32 sequence. Dice maps each draw to a die face. Shuffle uses the same seeded source to reorder a list.
