---
title: Export a state machine
description: Copy static XState v5 configuration or standalone JavaScript from one validated definition.
---

## What it measures

The two outputs encode the same states, initial state and transitions. XState JSON describes the machine; the JavaScript function computes one next state from a current state and event.

## How it is computed

Both outputs are generated only after validating the bounded JSON definition and current state. JSON serialization escapes every identifier rather than placing raw editor text into executable code. XState's [machine configuration](https://stately.ai/docs/machines) uses `initial`, `states` and per-state `on` transitions. The copied JSON is static configuration, not a live machine without an XState runtime.

## When to use it

Use the JSON when an XState v5 application will create the machine. Use the plain function for a small dependency-free transition model. Unhandled events leave the state unchanged; the generated function rejects unknown current states.

## Related

Machine lets you click through available events before copying either target.
