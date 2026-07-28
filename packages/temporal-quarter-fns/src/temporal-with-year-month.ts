import type { Temporal } from "ponyfill-temporal";

/**
 * Temporal types that have both a year and a month.
 */
export type TemporalWithYearMonth =
  | Temporal.PlainYearMonth
  | Temporal.PlainDateTime
  | Temporal.PlainDate
  | Temporal.ZonedDateTime;
