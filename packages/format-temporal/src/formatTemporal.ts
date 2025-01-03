import type { Intl, Temporal } from "temporal-spec";

/**
 * A type that can be formatted using {@link formatTemporal}.
 */
export type TemporalFormattable =
  | Temporal.PlainYearMonth
  | Temporal.PlainDateTime
  | Temporal.PlainDate
  | Temporal.PlainTime
  | Temporal.ZonedDateTime;

/**
 * Formats a {@link TemporalFormattable} with the provided format.
 *
 * One should use this and avoid using {@link Intl.DateTimeFormat#format} directly, since
 * not all Temporal types are compatible with it.
 *
 * @param temporal
 * @param format
 * @returns
 */
export const formatTemporal = (
  temporal: TemporalFormattable,
  format: Intl.DateTimeFormat,
): string => {
  return temporal[Symbol.toStringTag] === "Temporal.ZonedDateTime"
    ? temporal.toLocaleString(undefined, {
        ...(format.resolvedOptions() as Intl.DateTimeFormatOptions),
        timeZone: undefined,
      })
    : temporal[Symbol.toStringTag] === "Temporal.PlainYearMonth"
      ? (temporal as Temporal.PlainYearMonth).toLocaleString(undefined, {
          ...(format.resolvedOptions() as Intl.DateTimeFormatOptions),
          calendar: (temporal as Temporal.PlainYearMonth).calendarId,
        })
      : format.format(temporal);
};
