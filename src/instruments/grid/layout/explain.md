---
title: CSS Grid page layouts with named areas
description: Start from a sidebar, holy grail, or dashboard skeleton. Test its collapse width and copy the responsive CSS and HTML.
---

## What it measures

Layout shows how a familiar page skeleton occupies CSS Grid areas at a chosen viewport width. The sidebar preset has a header, sidebar, main region, and footer. Holy grail adds a second side region. Dashboard adds a summary region while keeping the sidebar beside the content. The preview uses the exact CSS and HTML available to copy, inside a frame sized to the simulated viewport. The area map below it remains legible even when a wide preview is scaled down. The fit result checks whether fixed sidebars and gaps consume more than the available content width. It does not resize a requested sidebar to make the result look valid. The [CSS Grid Layout specification](https://www.w3.org/TR/css-grid-2/) defines named areas and requires each named area to form a rectangle.

## How it is computed

The container is border-box sized. Its maximum width includes the inline padding labeled Pad; its outside margins center it when the viewport is wider. At widths below the collapse threshold, every region becomes one full-width row in the same order as the HTML. At the threshold and above, the named areas form the selected wide skeleton. A sidebar takes the chosen fixed width, and the main tracks take the remaining space with `minmax(0, 1fr)`. Holy grail uses that fixed width on both sides. Dashboard keeps one fixed sidebar and two flexible content tracks. The [CSS Media Queries specification](https://www.w3.org/TR/mediaqueries-5/) defines the `min-width` query that switches between these rules. Widths here are CSS pixels, not device categories. The fit check subtracts padding and fixed tracks from the available width, then accounts for gaps.

## When to use it

Choose the skeleton closest to the structure of the page, then set the sidebar to the width its real content needs. Move the simulated viewport across the collapse threshold and check both arrangements. If the fit warning appears, the wide layout asks for more horizontal space than the container has. Increase the collapse width, reduce fixed sidebars or gaps, or reconsider the structure before putting real content into it. No region disappears at the narrow width: the DOM and the one-column grid follow the same reading order. That matters for keyboard navigation and screen readers, whose order follows the document rather than a visual arrangement. The copied HTML is deliberately minimal. Replace the labels with actual content and check intrinsic sizes, long words, and images in the final page. [CSS Grid Layout Level 2](https://www.w3.org/TR/css-grid-2/) describes placement; it does not make overflowing content fit automatically.

## Related

Columns gives equal tracks and their calculated widths when a page does not need named areas. Breakpoints tests a range of min-width rules at precise boundaries. Baseline handles vertical line-box rhythm for the content placed inside a layout. Layout's three presets are starting structures, not templates that constrain the final page. Keep semantic HTML in source order even if a later design asks for a different visual placement. The [W3C page regions tutorial](https://www.w3.org/WAI/tutorials/page-structure/regions/) explains why landmarks matter alongside visual layout. If a screen needs a different navigation or content order, change the HTML deliberately instead of relying on `grid-area` to imply a new reading order. The CSS can then be adapted to that source structure.
