---
title: Step through a state machine
description: Edit a bounded JSON machine and click its valid events.
---

## What it measures

Machine shows the active state and the events that are valid from it. The built-in example moves between idle, loading, success and error. An event with no matching transition leaves the state unchanged in the pure model, but only available events get buttons.

## How it is computed

The JSON defines one initial state and unique `from`/`event`/`to` edges. Validation rejects missing targets, duplicate state-event pairs, unsupported fields and size limits. The next state comes from that single matching edge. This is a [finite-state machine](https://www.w3.org/TR/scxml/#Introduction), deliberately limited to a flat deterministic subset.

## When to use it

Use it to make a small interaction's allowed outcomes explicit. Invalid edits show an error and cannot run. Guards, actions, hierarchy, parallel states and history are outside this tool.

## Related

Export uses the same definition to produce static XState configuration JSON or a plain JavaScript transition function.
