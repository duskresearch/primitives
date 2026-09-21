---
title: Compare a timing curve with linear movement
description: Edit cubic Bézier points and see the resulting motion beside a linear reference.
---

## What it measures

Ease maps elapsed time to movement progress. The solid graph is the chosen curve; the dotted diagonal is linear time. Press Play to compare them at the same distance. The CSS value is the primary result. A spring selected on another Motion page remains selected here and is labeled as a sampled spring, never as a Bézier curve.

## How it is computed

For cubic Bézier timing, the x coordinate represents elapsed time and y represents output progress. The computation first solves x(t) for each elapsed fraction and then evaluates y(t). CSS Easing Functions Level 1 constrains the two x controls to 0–1; y controls may overshoot. The preview uses the exported CSS function, not a separate approximation.

## When to use it

Compare an unfamiliar curve against linear motion before applying it to a transition. The graph helps find abrupt starts and overshoot, while playback shows whether that behavior feels appropriate at the chosen duration and distance. Reduced-motion settings leave the graph and values available without requiring animation.

## Related

Spring exposes mass, stiffness and damping. Duration estimates time from distance and size. Export writes the selected curve for other targets. See the [CSS Easing Functions specification](https://www.w3.org/TR/css-easing-1/) for Bézier semantics.
