import type { TemporalComparable } from "./comparators.js";
import type { Interval } from "./interval.js";
import { compareTemporals, sortedTuple } from "./comparators.js";

/**
 * Checks if two intervals overlap.
 *
 * @param intervalLeft - The left interval.
 * @param intervalRight - The right interval.
 * @returns Whether the intervals overlap.
 */
export function areIntervalsOverlapping<T extends TemporalComparable>(
  intervalLeft: Interval<T>,
  intervalRight: Interval<T>,
): boolean {
  const [leftStartTime, leftEndTime] = sortedTuple(
    intervalLeft.start,
    intervalLeft.end,
  );
  const [rightStartTime, rightEndTime] = sortedTuple(
    intervalRight.start,
    intervalRight.end,
  );
  return (
    compareTemporals(leftStartTime, rightEndTime) === -1 &&
    compareTemporals(rightStartTime, leftEndTime) === -1
  );
}
