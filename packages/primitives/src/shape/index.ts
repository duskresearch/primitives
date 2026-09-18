// Shape: parametric forms, corners, clip-paths, blobs and icon sets as SVG and CSS. Logic
// arrives with each instrument (form, corner, polygon, blob, favicon) and is added to
// `operations` under the instrument's slug.
import type { Operation } from '../operation';

export const operations: Record<string, Operation<object, object>> = {};
