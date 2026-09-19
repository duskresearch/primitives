---
title: Line length checker, characters per line as max-width in ch
description: Drag a paragraph to a comfortable line length, see the characters per line against the 45 to 75 range, and copy it as max-width in ch.
---

## What it measures

Measure is the length of a line of text, counted in characters. The tool shows a paragraph you can drag narrower or wider, counts the characters on each line as it is set, and says whether that length is comfortable to read. The result is the width as CSS max-width in ch, so the column keeps its measure at any font size.

Size and leading change the reading too. Larger type needs a wider column for the same count, and longer lines need more space between them, so both are set beside the width. The count updates as you choose a new face or size in the panel, so you can see how a condensed face and a wide one fill the same column.

## How it is computed

The count is measured, not estimated: the paragraph's characters divided by the number of lines it wraps to at the chosen width, font and size.

```
characters a line = characters / lines
```

The comfortable range comes from Robert Bringhurst's The Elements of Typographic Style: 45 to 75 characters for a single column, with 66 widely regarded as ideal. WCAG 2.2 success criterion 1.4.8 (AAA) sets 80 as the upper limit.

The width is written in ch, a CSS unit equal to the width of the zero in the current font. Because ch scales with the font, a max-width in ch holds its measure when the size changes, which a width in px does not. Justified text changes the spacing between words but not the count, so the same limits apply.

## When to use it

Lines are too long on wide screens and you cannot tell by how much. Set the measure of every column of running text: articles, documentation, emails, long descriptions. Drag until the count sits in the comfortable band and the paragraph feels calm, then put the max-width on the text container rather than the page.

Narrow columns, such as cards and sidebars, often fall under 45. That is fine for short text, but set it ragged right rather than justified, so words do not stretch apart. For long reading, stay near 66. Headlines and short labels are exempt: the range is for running text, where the eye has to find the start of each next line. On phones the screen is usually narrower than the max-width, so the count falls on its own; the value matters on wide screens.

## Related

Measure sets the width of text. These instruments set its size and face.
