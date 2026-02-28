import type { z } from "zod";
import type { ZodTemporal } from "./temporalValidator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporalValidator.js";

export const Duration: typeof Temporal.Duration = Temporal.Duration;

/**
 * Regex pattern for {@link Temporal.Duration} ISO 8601 duration strings
 * (e.g. `PT1H30M`, `P1Y2M3DT4H5M6.5S`).
 * Supports years, months, weeks, days, hours, minutes, and decimal seconds.
 * A leading `-` is allowed for negative durations.
 */
export const DURATION_PATTERN =
  "^-?P(\\d+Y)?(\\d+M)?(\\d+W)?(\\d+D)?(T(\\d+H)?(\\d+M)?((\\d+(\\.\\d+)?)S)?)?$";

const validators = temporalValidators(Duration, {
  type: "string",
  id: "Duration",
  description: "An ISO 8601 duration string (e.g. PT1H30M, P1Y2M3D)",
  format: "duration",
});

/**
 * Validates or coerces a string to a {@link Temporal.Duration}.
 */
export const zDuration: ZodTemporal<typeof Duration> = validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.Duration}.
 */
export const zDurationInstance: z.ZodType<Temporal.Duration> =
  validators.instance;
