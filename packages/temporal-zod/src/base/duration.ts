import type {
  TemporalInstanceValidator,
  TemporalValidator,
} from "./temporal-validator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators, withError } from "./temporal-validator.js";

export const Duration: typeof Temporal.Duration = Temporal.Duration;

/**
 * Regex pattern for {@link Temporal.Duration} ISO 8601 duration strings
 * (e.g. `PT1H30M`, `P1Y2M3DT4H5M6.5S`).
 * Supports years, months, weeks, days, hours, minutes, and decimal seconds.
 * A leading `-` is allowed for negative durations.
 */
export const DURATION_PATTERN =
  "^-?P(\\d+Y)?(\\d+M)?(\\d+W)?(\\d+D)?(T(\\d+H)?(\\d+M)?((\\d+(\\.\\d+)?)S)?)?$";

/**
 * Validates or coerces a string to a {@link Temporal.Duration}.
 *
 * Use it directly, or call `.error({ error })` for a copy with a custom error
 * (e.g. `zDuration.error({ error: "Invalid duration" })`).
 */
export const zDuration: TemporalValidator<typeof Duration> = withError(
  (error) => temporalValidators(Duration, { error }).coerce,
);

/**
 * Validates that the value is an instance of {@link Temporal.Duration}.
 */
export const zDurationInstance: TemporalInstanceValidator<typeof Duration> =
  withError((error) => temporalValidators(Duration, { error }).instance);
