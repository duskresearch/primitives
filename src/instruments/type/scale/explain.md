---
title: Modular type scale with line heights, fixed or fluid with clamp()
description: Build every font size from one base and one ratio, with line heights, and copy it as CSS custom properties, fixed or fluid with clamp().
---

## What it measures

A type scale sets every size in a design from two decisions: a base size and a ratio. Each step up multiplies by the ratio and each step down divides by it, so the sizes relate to one another instead of being picked one at a time. The ratios are named for the musical intervals they come from, from the minor second (1.067), for close, quiet steps, to the golden ratio (1.618), for dramatic ones.

Every step comes with a line height, and your sample text is set at each size in the face you choose. The result is CSS custom properties for every step, fixed or fluid. Change the base and every size moves with it, keeping the same proportions to one another.

## How it is computed

```
size(n)     = base × ratio^n
line height = (size + 8px) / size
```

n counts steps from the base: 1 is one ratio up, -1 one down. The line height adds a fixed 8px to the size, which gives about 1.5 for body text and tightens toward 1.1 for large headings, as typesetters do by hand.

Fluid sizes use CSS clamp(). Each step grows in a straight line from its size in a smaller scale on a narrow screen to its size in this one on a wide screen, and holds still outside that range, the method Utopia made popular. The properties follow Tailwind's theme names, --text-lg and --text-lg--line-height, so they drop into Tailwind CSS 4 or plain CSS. Sizes are written in rem, against the browser's default of 16px, so they follow a reader's own font size setting.

## When to use it

Your sizes were picked one at a time and nothing lines up. Start a project here: choose a base that reads well for body text, usually 16 to 18px, and a ratio by how much contrast the design needs. Documents and dense interfaces sit well on a minor or major third; editorial and marketing pages can take a perfect fourth or more.

Fluid sizes let headings shrink on phones without breakpoints. Keep the narrow scale gentler than the wide one, because a large ratio on a small screen lets headings crowd out the text.

The line heights are a starting point. WCAG 2.2 success criterion 1.4.8 asks for line spacing of at least 1.5 within paragraphs, so do not set body text tighter.

## Related

Scale sets sizes. These instruments set the rest.
