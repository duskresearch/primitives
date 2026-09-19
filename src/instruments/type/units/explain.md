---
title: px to rem, em and pt converter, and tracking to letter-spacing
description: Convert a length between px, rem, em, pt and percent, and tracking from Figma or Adobe apps into CSS letter-spacing in em.
---

## What it measures

Units converts a length between the units CSS uses for type: px, rem, em, pt and percent. Type a value, choose its unit, and every other form is listed; the large value is the one you choose beside it. Your sample text is set at the converted size, so you can see what 18pt or 1.125rem actually looks like.

It also turns tracking into letter-spacing. Design tools write tracking in different ways: Figma as a percent of the font size, Adobe apps in thousandths of an em, some in pixels. CSS wants em, so the spacing keeps its proportion when the size changes. It works in both directions, so a rem value from code can be checked against the points in a spec.

## How it is computed

The definitions come from CSS Values and Units Level 4. A pixel is the reference unit, and an inch is fixed at both 96px and 72pt, so one point is four thirds of a pixel.

```
1pt  = 96 / 72 px, about 1.333px
1rem = the root font size, 16px by default
1em  = the element's own font size
```

rem follows the root, the font size on the html element, which is 16px unless the page or the reader changes it. em and percent follow the element's own size, which the tool calls the context. Tracking converts by the same logic: 1% in Figma is 0.01em, and 50 in Adobe's units is 0.05em. Percent is the element's size as a share of the context, so 150% of a 16px context is 24px. Letter-spacing in em is multiplied by the element's own size, which is why it scales with the text without being worked out again.

## When to use it

The spec is in points and tracking, and the CSS is in rem and em. Use rem for font sizes, so text scales when readers raise their browser's default size; WCAG 2.2 success criterion 1.4.4 asks for text that still works at 200%. Use em for letter-spacing and for spacing that should grow with the text it belongs to. Keep px for hairlines and borders that should stay crisp.

Points belong to print and to the design tools that inherited them. Convert them once, at the handoff, rather than carrying them into code. When a design uses a base other than 16px, set the root here to match, but keep the html element's size at 100% in CSS, so readers' own settings still apply.

## Related

Units converts single values. These instruments decide them.
