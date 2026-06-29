import type {
  TemporalInstanceValidator,
  TemporalValidator,
} from "./temporal-validator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators, withError } from "./temporal-validator.js";

export const PlainDate: typeof Temporal.PlainDate = Temporal.PlainDate;

/**
 * Regex pattern for {@link Temporal.PlainDate} ISO 8601 strings (e.g. `2023-01-15`).
 * Validates month (01–12) and day (01–31).
 */
export const PLAIN_DATE_PATTERN =
  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$";

/**
 * Validates or coerces a string to a {@link Temporal.PlainDate}.
 *
 * Use it directly, or call `.error({ error })` for a copy with a custom error
 * (e.g. `zPlainDate.error({ error: "Invalid date" })`).
 */
export const zPlainDate: TemporalValidator<typeof PlainDate> = withError(
  (error) => temporalValidators(PlainDate, { error }).coerce,
);

/**
 * Validates that the value is an instance of {@link Temporal.PlainDate}.
 */
export const zPlainDateInstance: TemporalInstanceValidator<typeof PlainDate> =
  withError((error) => temporalValidators(PlainDate, { error }).instance);
