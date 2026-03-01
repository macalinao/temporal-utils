import type { TemporalComparable } from "./comparators.js";
import type { Interval } from "./interval.js";
import { compareTemporals, sortedTuple } from "./comparators.js";

export function isWithinInterval<T extends TemporalComparable>(
  value: T,
  interval: Interval<T>,
): boolean {
  const [startTime, endTime] = sortedTuple(interval.start, interval.end);
  return (
    compareTemporals(value, startTime) >= 0 &&
    compareTemporals(value, endTime) <= 0
  );
}
