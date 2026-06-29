import type {
  TemporalInstanceValidator,
  TemporalValidator,
} from "./temporal-validator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators, withError } from "./temporal-validator.js";

export const PlainYearMonth: typeof Temporal.PlainYearMonth =
  Temporal.PlainYearMonth;

/**
 * Regex pattern for {@link Temporal.PlainYearMonth} ISO 8601 strings (e.g. `2023-01`).
 * Validates month (01–12).
 */
export const PLAIN_YEAR_MONTH_PATTERN = "^\\d{4}-(0[1-9]|1[0-2])$";

/**
 * Validates or coerces a string to a {@link Temporal.PlainYearMonth}.
 *
 * Use it directly, or call `.error({ error })` for a copy with a custom error
 * (e.g. `zPlainYearMonth.error({ error: "Invalid year-month" })`).
 */
export const zPlainYearMonth: TemporalValidator<typeof PlainYearMonth> =
  withError((error) => temporalValidators(PlainYearMonth, { error }).coerce);

/**
 * Validates that the value is an instance of {@link Temporal.PlainYearMonth}.
 */
export const zPlainYearMonthInstance: TemporalInstanceValidator<
  typeof PlainYearMonth
> = withError(
  (error) => temporalValidators(PlainYearMonth, { error }).instance,
);
