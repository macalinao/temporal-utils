import type { Intl, Temporal } from "ponyfill-temporal";

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

const ISO_CALENDAR = "iso8601";

/**
 * Calendar used for ISO values when the formatter itself resolves to the ISO
 * calendar; CLDR carries no month names under `iso8601`.
 */
const FALLBACK_CALENDAR = "gregory";

/**
 * A leap year, so `--02-29` survives the trip through a {@link Temporal.PlainDate}.
 */
const MONTH_DAY_REFERENCE_YEAR = 1972;

/**
 * `PlainYearMonth` and `PlainMonthDay` reject a formatter whose calendar
 * differs from their own, so they have to be formatted under their own
 * calendar — except under `iso8601`, which has no localized month names in
 * CLDR and renders `2023-05` as `"2023 "`. ISO values are therefore
 * re-expressed in the calendar the formatter resolved to.
 */
const calendarFor = (
  calendarId: string,
  options: globalThis.Intl.DateTimeFormatOptions,
): string => {
  if (calendarId !== ISO_CALENDAR) {
    return calendarId;
  }
  return options.calendar && options.calendar !== ISO_CALENDAR
    ? options.calendar
    : FALLBACK_CALENDAR;
};

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
    case "Temporal.PlainYearMonth": {
      const yearMonth = temporal as Temporal.PlainYearMonth;
      const options =
        format.resolvedOptions() as globalThis.Intl.DateTimeFormatOptions;
      const calendar = calendarFor(yearMonth.calendarId, options);
      const formattable =
        calendar === yearMonth.calendarId
          ? yearMonth
          : yearMonth
              .toPlainDate({ day: 1 })
              .withCalendar(calendar)
              .toPlainYearMonth();
      return formattable.toLocaleString(undefined, { ...options, calendar });
    }
    case "Temporal.PlainMonthDay": {
      const monthDay = temporal as Temporal.PlainMonthDay;
      const options =
        format.resolvedOptions() as globalThis.Intl.DateTimeFormatOptions;
      const calendar = calendarFor(monthDay.calendarId, options);
      const formattable =
        calendar === monthDay.calendarId
          ? monthDay
          : monthDay
              .toPlainDate({ year: MONTH_DAY_REFERENCE_YEAR })
              .withCalendar(calendar)
              .toPlainMonthDay();
      return formattable.toLocaleString(undefined, { ...options, calendar });
    }
    default:
      // The `ZonedDateTime`, `PlainYearMonth`, and `PlainMonthDay` cases are
      // handled above, so `temporal` here is one of the directly-formattable
      // types; `Symbol.toStringTag` isn't a narrowing discriminant, so we assert
      // it to `Intl.FormattableTemporalObject`.
      return format.format(temporal as Intl.FormattableTemporalObject);
  }
};
