---
title: Inspect a translucent blur
description: Adjust backdrop blur and panel alpha with a named solid fallback.
---

## What it measures

Blur applies actual `backdrop-filter: blur()` and a translucent background to a fixed specimen. It reports one text contrast ratio for a modeled uniform backdrop color, not for every area of the patterned preview or another page.

## How it is computed

The selected background is alpha-composited over the named sample color `#d8d4c9`. The foreground text and resulting composite are converted to relative luminance, then compared with the [WCAG 2.2 contrast formula](https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio). Blur radius does not enter that simple uniform-sample calculation. The [CSS backdrop-filter specification](https://drafts.fxtf.org/filter-effects-2/#BackdropFilterProperty) defines the visual filter; a solid background declaration is supplied separately as a fallback.

## When to use it

Use the preview to inspect translucency, then test the real content behind a panel. Changing images, patterns, blur boundaries or browser rendering can change text contrast; no general accessibility pass is claimed.

## Related

Shadow builds one layered depth effect. Elevation creates a related set of them.
