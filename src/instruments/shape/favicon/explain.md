---
title: Favicon files from a geometric mark
description: Generate SVG, ICO, Apple touch and manifest icons from one form, then download a ZIP.
---

## What it measures

Favicon turns the shared Form geometry into a small icon set with chosen foreground, background, and padding. The preview is the generated SVG shown at several actual sizes. Apple touch and PNG icons have an opaque full-bleed background.

## How it is computed

The same generated SVG is rasterized locally with browser Canvas for 16, 32, 48, 180, 192, and 512 pixel images. The ICO contains three PNG-encoded images. The uncompressed ZIP stores CRC-32 checksums under the [ZIP APPNOTE format](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT). The manifest follows the [Web App Manifest icon members](https://www.w3.org/TR/appmanifest/#icons-member). No icon is labeled maskable; padding would make that promise inaccurate.

## When to use it

Unpack the ZIP into your site's public root and place the integration HTML in its document head. Adjust paths if files live elsewhere. Check the mark at 16 pixels before using it. This set covers common favicon, Apple touch, and manifest sizes but does not cover every platform convention.

## Related

Form exports the single SVG mark. Polygon and Blob offer different shapes, but this package intentionally uses Form geometry, not uploads or another brand logo.
