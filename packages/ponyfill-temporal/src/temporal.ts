import type { Intl as SpecIntl, Temporal as SpecTemporal } from "temporal-spec";
import type { TemporalApi } from "./load-temporal.js";
import { loadTemporal } from "./load-temporal.js";

/**
 * The Temporal API, resolved once at module-evaluation time via **top-level
 * await**. Because {@link loadTemporal} only performs
 * `await import("temporal-polyfill")` when native Temporal is missing, a native
 * runtime resolves this synchronously and never loads the polyfill chunk.
 *
 * The `Temporal`, `Intl`, and `toTemporalInstant` exports below are
 * synchronously usable (`new Temporal.PlainDate(...)`, `Temporal.Now.instant()`,
 * etc.) — no `await` at the call site.
 */
const api: TemporalApi = await loadTemporal();

export const Temporal: TemporalApi["Temporal"] = api.Temporal;
// biome-ignore lint/suspicious/noShadowRestrictedNames: mirrors the Temporal-spec `Intl`
export const Intl: TemporalApi["Intl"] = api.Intl;
export const toTemporalInstant: TemporalApi["toTemporalInstant"] =
  api.toTemporalInstant;

// Merge the runtime value bindings above with the `temporal-spec` type
// namespaces so `Temporal` / `Intl` are usable as both values and type
// namespaces (e.g. `Temporal.PlainDate` in a type position), mirroring how
// `temporal-polyfill` exports them. These ambient blocks are generated from
// `temporal-spec`'s public surface; the handful of generic option helper types
// (e.g. `RoundingOptions<Units>`) are intentionally omitted.
// eslint-disable-next-line @typescript-eslint/no-namespace -- merges the type namespace onto the value binding above
export declare namespace Temporal {
  export type CalendarLike = SpecTemporal.CalendarLike;
  export type DateLikeObject = SpecTemporal.DateLikeObject;
  export type DateTimeLikeObject = SpecTemporal.DateTimeLikeObject;
  export type DateUnit = SpecTemporal.DateUnit;
  export type DisambiguationOptions = SpecTemporal.DisambiguationOptions;
  export type Duration = SpecTemporal.Duration;
  export type DurationConstructor = SpecTemporal.DurationConstructor;
  export type DurationFormatOptions = SpecTemporal.DurationFormatOptions;
  export type DurationLike = SpecTemporal.DurationLike;
  export type DurationLikeObject = SpecTemporal.DurationLikeObject;
  export type DurationRelativeToOptions =
    SpecTemporal.DurationRelativeToOptions;
  export type DurationRoundingOptions = SpecTemporal.DurationRoundingOptions;
  export type DurationToStringOptions = SpecTemporal.DurationToStringOptions;
  export type DurationTotalOptions = SpecTemporal.DurationTotalOptions;
  export type Instant = SpecTemporal.Instant;
  export type InstantConstructor = SpecTemporal.InstantConstructor;
  export type InstantLike = SpecTemporal.InstantLike;
  export type InstantToStringOptions = SpecTemporal.InstantToStringOptions;
  export type OverflowOptions = SpecTemporal.OverflowOptions;
  export type PlainDate = SpecTemporal.PlainDate;
  export type PlainDateConstructor = SpecTemporal.PlainDateConstructor;
  export type PlainDateLike = SpecTemporal.PlainDateLike;
  export type PlainDateTime = SpecTemporal.PlainDateTime;
  export type PlainDateTimeConstructor = SpecTemporal.PlainDateTimeConstructor;
  export type PlainDateTimeLike = SpecTemporal.PlainDateTimeLike;
  export type PlainDateTimeToStringOptions =
    SpecTemporal.PlainDateTimeToStringOptions;
  export type PlainDateToStringOptions = SpecTemporal.PlainDateToStringOptions;
  export type PlainDateToZonedDateTimeOptions =
    SpecTemporal.PlainDateToZonedDateTimeOptions;
  export type PlainMonthDay = SpecTemporal.PlainMonthDay;
  export type PlainMonthDayConstructor = SpecTemporal.PlainMonthDayConstructor;
  export type PlainMonthDayLike = SpecTemporal.PlainMonthDayLike;
  export type PlainMonthDayToPlainDateOptions =
    SpecTemporal.PlainMonthDayToPlainDateOptions;
  export type PlainTime = SpecTemporal.PlainTime;
  export type PlainTimeConstructor = SpecTemporal.PlainTimeConstructor;
  export type PlainTimeLike = SpecTemporal.PlainTimeLike;
  export type PlainTimeToStringOptions = SpecTemporal.PlainTimeToStringOptions;
  export type PlainYearMonth = SpecTemporal.PlainYearMonth;
  export type PlainYearMonthConstructor =
    SpecTemporal.PlainYearMonthConstructor;
  export type PlainYearMonthLike = SpecTemporal.PlainYearMonthLike;
  export type PlainYearMonthToPlainDateOptions =
    SpecTemporal.PlainYearMonthToPlainDateOptions;
  export type TimeLikeObject = SpecTemporal.TimeLikeObject;
  export type TimeUnit = SpecTemporal.TimeUnit;
  export type TimeZoneLike = SpecTemporal.TimeZoneLike;
  export type TransitionOptions = SpecTemporal.TransitionOptions;
  export type YearMonthLikeObject = SpecTemporal.YearMonthLikeObject;
  export type ZonedDateTime = SpecTemporal.ZonedDateTime;
  export type ZonedDateTimeConstructor = SpecTemporal.ZonedDateTimeConstructor;
  export type ZonedDateTimeFromOptions = SpecTemporal.ZonedDateTimeFromOptions;
  export type ZonedDateTimeLike = SpecTemporal.ZonedDateTimeLike;
  export type ZonedDateTimeLikeObject = SpecTemporal.ZonedDateTimeLikeObject;
  export type ZonedDateTimeToStringOptions =
    SpecTemporal.ZonedDateTimeToStringOptions;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- merges the type namespace onto the value binding above
export declare namespace Intl {
  export type DateTimeFormat = SpecIntl.DateTimeFormat;
  export type FormattableTemporalObject = SpecIntl.FormattableTemporalObject;
}
