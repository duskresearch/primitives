---
title: CSS grid columns, gaps, and container width
description: Set a column grid at a simulated viewport width, check the resulting track widths, and copy the matching CSS.
---

## What it measures

Columns divides a container into equal tracks. The controls set the number of columns, the gap between adjacent tracks, the inline padding inside the container, and its maximum width. The preview uses the CSS shown below it at the simulated viewport width. When that width exceeds the maximum, the container stays centered and its content width stops growing. The track width shown is a logical CSS-pixel measurement, even when the preview is reduced to fit this page. If the requested gaps take more space than the content box, the tool reports the excess instead of changing the gap or column count. That is a useful warning before a grid is put into a page with real content.

## How it is computed

The container is border-box sized. Its width is the smaller of the viewport and maximum width; inline padding is subtracted once on each side. Total gap is the number of spaces between columns times the chosen gap. The remaining content width is divided evenly among the tracks.

```
track = (container − 2 × margin − (columns − 1) × gap) ÷ columns
```

The exported rule uses [CSS Grid Layout Level 2](https://www.w3.org/TR/css-grid-2/)'s `repeat()` and `minmax(0, 1fr)` for equal fractional tracks. The zero minimum prevents content from silently widening a track, while `gap` keeps the chosen space between tracks. [CSS Box Sizing Level 3](https://www.w3.org/TR/css-sizing-3/)'s `border-box` keeps padding within the stated maximum width. If gap space exceeds content space, the mathematical track width is negative; CSS cannot draw negative tracks, so the displayed track width is zero and the excess is reported separately. The preview runs the exact exported grid rule.

## When to use it

Start with the viewport where the grid has the least room. Raise columns or gaps until content would become cramped, then check a wider width to see where the maximum container width holds. A twelve-column grid is useful when components need halves, thirds, and quarters, but the count is not a requirement. Fewer columns may make the actual layout easier to maintain.

Copy the CSS onto the element that owns the grid. Its children become the tracks' grid items; place a component across multiple tracks with `grid-column` in your own stylesheet. Margin here means inline padding inside the container, not the outside space made by automatic centering. The preview's items are placeholders, so test text, images, and minimum widths in the real layout before relying on a narrow track.

## Related

Breakpoints tests how column counts change across viewport widths. Layout provides named-area page skeletons. Baseline handles vertical line-box rhythm rather than horizontal tracks.
