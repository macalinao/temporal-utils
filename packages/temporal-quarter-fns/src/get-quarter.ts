/**
 * The {@link getQuarter} function options.
 */

import type { Temporal } from "temporal-spec";

/**
 * A quarter of a year, one-indexed.
 */
export type Quarter = 1 | 2 | 3 | 4;

/**
 * @name getQuarter
 * @category Quarter Helpers
 * @summary Get the year quarter of the given date.
 *
 * @description
 * Get the year quarter of the given date.
 *
 * @param date - The given date
 * @param options - An object with options
 *
 * @returns The quarter
 *
 * @example
 * // Which quarter is 2 July 2014?
 * const result = getQuarter(new Date(2014, 6, 2));
 * //=> 3
 */
export function getQuarter(
  date:
    | Temporal.PlainDate
    | Temporal.PlainYearMonth
    | Temporal.PlainDateTime
    | Temporal.ZonedDateTime,
): 1 | 2 | 3 | 4 {
  const quarter = Math.trunc((date.month - 1) / 3) + 1;
  if (quarter < 1 || quarter > 4) {
    throw new Error("Invalid quarter");
  }
  return quarter as 1 | 2 | 3 | 4;
}
