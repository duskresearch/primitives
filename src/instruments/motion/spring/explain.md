---
title: Tune a damped spring
description: Adjust mass, stiffness, damping and initial velocity, then copy a CSS linear() approximation.
---

## What it measures

Spring shows a unit movement toward a target. Mass, stiffness, damping and initial velocity shape its travel. The graph includes overshoot; settling time requires both position error and speed to be below explicit tolerances.

## How it is computed

The damped harmonic oscillator is solved separately for underdamped, critically damped and overdamped cases. Settling is checked through ten seconds against a position error of 0.001 and speed of 0.001 per second. A settled curve is adaptively sampled into a CSS linear() function, up to 256 stops. The tool separately reports an unmet midpoint approximation target or a spring still moving after ten seconds. CSS Easing Functions Level 2 defines [linear()](https://www.w3.org/TR/css-easing-2/#the-linear-easing-function).

## When to use it

Use a spring when overshoot and return help communicate a response. CSS copying is withheld when the spring has not settled by the ten-second limit; the graph and playback are then truncated previews, not a finished transition. Reduced-motion users can inspect the static curve without playback.

## Related

Ease compares the spring with linear movement. Export preserves physical spring parameters for Motion for React and SwiftUI, while noting that runtimes may settle differently.
