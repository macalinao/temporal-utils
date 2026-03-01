import type { TemporalComparable } from "./comparators.js";
import type { Interval } from "./interval.js";
import { compareTemporals } from "./comparators.js";

/**
 * Normalizes the ranges by combining overlapping ranges and sorting them.
 *
 * @param intervals - The intervals to normalize.
 */
export const normalizeIntervals = <T extends TemporalComparable>(
  intervals: Interval<T>[],
): Interval<T>[] => {
  const sortedIntervals = intervals.sort((a, b) =>
    compareTemporals<T>(a.start, b.start),
  );
  const firstInterval = sortedIntervals[0];
  if (!firstInterval) {
    return [];
  }

  const normalizedRanges: Interval<T>[] = [];
  let currentRange: Interval<T> = firstInterval;

  for (let i = 1; i < sortedIntervals.length; i++) {
    const nextRange = sortedIntervals[i];
    if (!nextRange) {
      break;
    }

    if (compareTemporals(nextRange.start, currentRange.end) <= 0) {
      currentRange = {
        start: currentRange.start,
        end:
          compareTemporals(currentRange.end, nextRange.end) <= 0
            ? nextRange.end
            : currentRange.end,
      };
    } else {
      normalizedRanges.push(currentRange);
      currentRange = nextRange;
    }
  }

  normalizedRanges.push(currentRange);

  return normalizedRanges;
};
