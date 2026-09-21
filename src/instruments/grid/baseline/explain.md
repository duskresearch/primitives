---
title: Vertical rhythm and line-box alignment
description: Compare real text line boxes with a vertical step, find the nearest compatible line height, and copy the CSS values.
---

## What it measures

Baseline compares the height of each line box with a repeating vertical step. The gray lines mark that step; the gold edges mark the ends of the sample's line boxes. When those edges land on gray lines, the line-box rhythm is aligned. The large value is the step in CSS pixels. Change the font size, requested line height, and overlay offset to see how the relationship changes. The sample uses the site's Hanken Grotesk face, not placeholder rectangles.

This is deliberately a line-box measurement, not a claim about the actual baseline inside each glyph. A font's ascent, descent, and internal leading determine where glyph baselines sit within line boxes. Aligning those glyph baselines would require measuring font metrics and the first rendered baseline separately. The overlay here answers the narrower layout question: whether repeated line-height intervals and their starting phase follow the chosen step.

## How it is computed

The nearest suggestion is a multiple of the step that is at least the font size and within the line-height control's 12–64px range. Of two equally near values, the larger wins. Drift is the requested line height minus that suggestion, in pixels per line. A negative value means each requested interval is shorter; a positive value means longer. The alignment label also requires an overlay offset of zero, because a shifted overlay cannot mark the sample's line-box edges even when the interval divides evenly.

```
drift per line = requested line height − nearest valid step multiple
```

[CSS Inline Layout Level 3](https://www.w3.org/TR/css-inline-3/) defines line boxes, `line-height`, and the distinction between a line box and its internal glyph baseline. The CSS shown here records the step, phase, font size, and requested line height as values; the custom properties are hooks for your own overlay, not a built-in CSS baseline grid.

## When to use it

Use a vertical step when repeated text blocks need predictable spacing with other elements. Start with a readable font size and line height, then choose a step that divides the line height. Eight pixels with 24px line height is a common example, but a smaller step offers more placement choices. Apply the suggested line height only if it still reads comfortably; arithmetic alignment is not a substitute for reading the text.

The offset is a phase control for the overlay. Leave it at zero when checking the shown line-box edges, or move it to inspect why a shifted grid no longer coincides. In a real page, padding and surrounding components can shift the first line's position, so use the overlay alongside the actual layout. This tool does not measure glyph baselines, cap height, or optical alignment. Those can differ across typefaces even when line boxes follow the same step.

## Related

Columns divides horizontal space into CSS tracks. Layout supplies responsive page skeletons. Type Scale sets font sizes and line heights across a type ramp.
