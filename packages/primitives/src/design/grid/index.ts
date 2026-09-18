// Grid: columns, breakpoints, baselines and layouts as CSS. Logic arrives with each
// instrument (columns, breakpoints, baseline, layout) and is added to `operations` under
// the instrument's slug.
import type { Operation } from '../../operation';

export const operations: Record<string, Operation<object, object>> = {};
