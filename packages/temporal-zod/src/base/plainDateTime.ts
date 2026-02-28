import type { z } from "zod";
import type { ZodTemporal } from "./temporalValidator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporalValidator.js";

export const PlainDateTime: typeof Temporal.PlainDateTime =
  Temporal.PlainDateTime;

/**
 * Regex pattern for {@link Temporal.PlainDateTime} ISO 8601 strings (e.g. `2023-01-15T13:45:30`).
 * Validates month (01–12), day (01–31), hours (00–23), minutes/seconds (00–59),
 * and up to 9 fractional digits. No timezone offset.
 */
export const PLAIN_DATE_TIME_PATTERN =
  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])T([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d(\\.\\d{1,9})?)?$";

const validators = temporalValidators(PlainDateTime, {
  type: "string",
  id: "PlainDateTime",
  description:
    "An ISO 8601 date-time string without timezone (e.g. 2023-01-15T13:45:30)",
  pattern: PLAIN_DATE_TIME_PATTERN,
});

/**
 * Validates or coerces a string to a {@link Temporal.PlainDateTime}.
 */
export const zPlainDateTime: ZodTemporal<typeof PlainDateTime> =
  validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.PlainDateTime}.
 */
export const zPlainDateTimeInstance: z.ZodType<Temporal.PlainDateTime> =
  validators.instance;
