---
title: Make a repeatable sequence
description: Share a uint32 seed and reproduce the same Mulberry32 values.
---

## What it measures

Seed emits a finite list of unsigned 32-bit integers. The same seed and count always return the same values. The seed lives in the URL with the result settings, so a shared link reproduces the sequence.

## How it is computed

Mulberry32 advances a 32-bit state by a fixed constant, then mixes bits with shifts and integer multiplication. This is a small deterministic generator, not a cryptographic generator. Pressing New seed asks the browser’s [Crypto.getRandomValues()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) for a fresh uint32 and stores that explicit value in the URL; no entropy is read on page load.

## When to use it

Use a fixed seed for demos, tests and reproducible design variations. Do not use seeded output for passwords, security tokens or drawings that must be unpredictable to an observer.

## Related

Range maps the same sequence to inclusive integers. Dice simulates rolls. Shuffle permutes nonblank list lines.
