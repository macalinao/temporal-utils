import type { Intl, Temporal } from "temporal-spec";

/**
 * A type that can be formatted using {@link formatTemporal}.
 */
export type TemporalFormattable =
  | Temporal.Instant
  | Temporal.PlainYearMonth
  | Temporal.PlainMonthDay
  | Temporal.PlainDateTime
  | Temporal.PlainDate
  | Temporal.PlainTime
  | Temporal.ZonedDateTime;

/**
 * Formats a {@link TemporalFormattable} with the provided {@link Intl.DateTimeFormat}.
 *
 * Three types of Temporal objects cannot be directly formatted with {@link Intl.DateTimeFormat#format}:
 * - {@link Temporal.ZonedDateTime}
 * - {@link Temporal.PlainYearMonth}
 * - {@link Temporal.PlainMonthDay}
 * This function formats these other types by calling their `toLocaleString` method directly.
 *
 * @param temporal The {@link TemporalFormattable} to format.
 * @param format The {@link Intl.DateTimeFormat} to use for formatting.
 * @returns
 */
export const formatTemporal = (
  temporal: TemporalFormattable,
  format: Intl.DateTimeFormat,
): string => {
  switch (temporal[Symbol.toStringTag]) {
    case "Temporal.ZonedDateTime":
      return temporal.toLocaleString(undefined, {
        ...(format.resolvedOptions() as globalThis.Intl.DateTimeFormatOptions),
        timeZone: undefined,
      });
    case "Temporal.PlainYearMonth":
      return (temporal as Temporal.PlainYearMonth).toLocaleString(undefined, {
        ...(format.resolvedOptions() as globalThis.Intl.DateTimeFormatOptions),
        calendar: (temporal as Temporal.PlainYearMonth).calendarId,
      });
    case "Temporal.PlainMonthDay":
      return (temporal as Temporal.PlainMonthDay).toLocaleString(undefined, {
        ...(format.resolvedOptions() as globalThis.Intl.DateTimeFormatOptions),
        calendar: (temporal as Temporal.PlainMonthDay).calendarId,
      });
    default:
      return format.format(temporal);
  }
};
