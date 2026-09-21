---
title: CSS grid breakpoints and media queries
description: Set five minimum viewport widths, test the active grid at any width, and copy the complete responsive CSS.
---

## What it measures

Breakpoints shows which minimum-width rule applies at a chosen CSS viewport width. The starting values follow the familiar names in [Tailwind CSS responsive design](https://tailwindcss.com/docs/responsive-design): sm, md, lg, xl, and 2xl. Tailwind defines them in rem; the numbers here are their pixel equivalents at a 16px browser default font size. A different browser font-size preference changes that mapping. They are editable CSS-pixel thresholds, not labels for phones, tablets, or other device classes. A narrow browser window and a wide phone can both fall in the same range. The preview runs the exported media queries inside a frame set to the simulated width, so the outer browser window does not decide which columns appear. The highlighted range and column count give a quick reading of that same rule.

## How it is computed

The base rule makes one column. At each minimum width, a later `@media` rule changes `grid-template-columns`. The policy is one column below sm, up to two at sm, up to four at md, up to six at lg, and the selected full column count at xl and 2xl. If the selected count is smaller than a range's cap, that range never invents extra columns. The thresholds must remain strictly increasing; each control stops before its neighbor. [Media Queries Level 4](https://www.w3.org/TR/mediaqueries-4/) defines width as a viewport feature, and a min-width condition includes its boundary. Therefore 767px is below a 768px md threshold, while 768px is in md. The exported CSS includes the container's max-width, padding, gap, base grid, and all five media rules.

## When to use it

Move the simulated width across a threshold and watch whether the grid gains columns at a useful point. If content starts to crowd before the change, move that threshold down; if the extra columns appear too early, move it up. The five starting widths are familiar reference points, not a reason to keep any particular number. In Tailwind's own wording, responsive prefixes are minimum widths rather than device targets. This tool exports ordinary CSS media queries, not Tailwind utility classes. Use the copied rules on a grid container with child items. The preview contains equal placeholders, so it cannot tell whether real labels, images, or minimum content sizes fit. Check those in the intended layout, especially near each boundary.

## Related

Columns sets the equal-track grid without responsive rules. Layout provides page skeletons with named areas and a collapse width. Baseline measures vertical line-box rhythm rather than viewport ranges.
