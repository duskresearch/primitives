---
title: Generate UUID v4 or v7
description: Inspect a deterministic example or make a replayable identifier on request.
---

## What it measures

UUID shows an RFC 9562 identifier with version and variant bits in their required positions. The first render is a deterministic example, not a newly random ID. Generate requests browser entropy on click and records the bytes in the URL so a reload reproduces the same identifier.

## How it is computed

Version 4 keeps random bytes except for the fixed version and variant bits. Version 7 writes a 48-bit Unix millisecond timestamp first, then random bits around the fixed version and variant fields. [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562.html) defines both layouts. The browser’s [Crypto.getRandomValues()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) supplies bytes on Generate. A URL cannot prove how its bytes were sourced.

## When to use it

Generate when a new identifier is needed; copy the displayed example only if a known fixed ID is intentional. This implementation does not use a monotonic counter, so multiple v7 IDs in one millisecond are not promised to sort by generation order.

## Related

Seed is for repeatable, noncryptographic sequences. Range and Dice turn that seed into numbers.
