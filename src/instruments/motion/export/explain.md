---
title: Write motion values for implementation
description: Export the selected curve to CSS, Motion for React or SwiftUI.
---

## What it measures

Export expresses the chosen Motion curve in the selected target’s syntax. The same URL carries the active curve model, its parameters and the Bézier duration. Inactive parameters remain saved, but only the active model is exported.

## How it is computed

A Bézier maps its four control points directly to CSS cubic-bezier(), a Motion ease array or SwiftUI timingCurve(); durations become seconds where those APIs require seconds. Motion for React documents its [transition options](https://motion.dev/docs/react-transitions), including cubic arrays and physical spring parameters. Apple documents [SwiftUI timingCurve](https://developer.apple.com/documentation/swiftui/animation/timingcurve(_:duration:)). For a spring, CSS uses a sampled linear() approximation, while Motion receives mass, stiffness, damping and velocity.

## When to use it

Copy a target’s result into a transition declaration and test it in context. Springs do not have identical termination rules across runtimes. No exact SwiftUI export for these four physics parameters is claimed; that selection provides a labeled web approximation instead.

## Related

Ease compares timing against linear motion. Spring shows the sampled path and error. Duration estimates a time for distance and element size.
