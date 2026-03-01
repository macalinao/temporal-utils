/**
 * The {@link startOfQuarter} function options.
 */

import type { TemporalWithYearMonth } from "./temporal-with-year-month.js";

/**
 * @name startOfQuarter
 * @category Quarter Helpers
 * @summary Return the start of a year quarter for the given date.
 *
 * @description
 * Return the start of a year quarter for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 *
 * @returns The start of a quarter
 *
 * @example
 * // The start of a quarter for 2 September 2014 11:55:00:
 * const result = startOfQuarter(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Tue Jul 01 2014 00:00:00
 */
export function startOfQuarter<T extends TemporalWithYearMonth>(date: T): T {
  const currentMonthZeroIndexed = date.month - 1;
  const month = currentMonthZeroIndexed - (currentMonthZeroIndexed % 3) + 1;
  const result = date.with({ month, day: 1 }) as T;
  return result;
}
