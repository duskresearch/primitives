// Type: modular scales, measure, unit conversion, fallback metrics. Logic arrives with
// each instrument (scale, specimen, measure, units, fallback) and is added to `operations`
// under the instrument's slug.
import type { Operation } from '../operation';

export const operations: Record<string, Operation<object, object>> = {};
