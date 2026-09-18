// Motion: easing curves, springs, durations, stagger and export to CSS, Framer Motion and
// SwiftUI. Logic arrives with each instrument (ease, spring, duration, stagger, export) and
// is added to `operations` under the instrument's slug.
import type { Operation } from '../operation';

export const operations: Record<string, Operation<object, object>> = {};
