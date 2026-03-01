import type { Temporal } from "temporal-polyfill";

/**
 * Temporal types that have both a year and a month.
 */
export type TemporalWithYearMonth =
  | Temporal.PlainYearMonth
  | Temporal.PlainDateTime
  | Temporal.PlainDate
  | Temporal.ZonedDateTime;
