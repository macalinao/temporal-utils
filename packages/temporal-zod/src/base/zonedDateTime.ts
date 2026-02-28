import type { z } from "zod";
import type { ZodTemporal } from "./temporalValidator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporalValidator.js";

export const ZonedDateTime: typeof Temporal.ZonedDateTime =
  Temporal.ZonedDateTime;

/**
 * Regex pattern for {@link Temporal.ZonedDateTime} ISO 8601 strings
 * (e.g. `2023-01-15T13:45:30+08:00[Asia/Manila]`).
 * Validates month (01–12), day (01–31), hours (00–23), minutes/seconds (00–59),
 * up to 9 fractional digits, a UTC offset (Z or ±HH:MM), and a required IANA timezone
 * annotation in brackets.
 */
export const ZONED_DATE_TIME_PATTERN =
  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])T([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d(\\.\\d{1,9})?)?(Z|[+-]([01]\\d|2[0-3]):[0-5]\\d)\\[.+\\]$";

const validators = temporalValidators(ZonedDateTime, {
  type: "string",
  id: "ZonedDateTime",
  description:
    "An ISO 8601 date-time string with timezone offset and IANA annotation (e.g. 2023-01-15T13:45:30+08:00[Asia/Manila])",
  pattern: ZONED_DATE_TIME_PATTERN,
});

/**
 * Validates or coerces a string to a {@link Temporal.ZonedDateTime}.
 */
export const zZonedDateTime: ZodTemporal<typeof ZonedDateTime> =
  validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.ZonedDateTime}.
 */
export const zZonedDateTimeInstance: z.ZodType<Temporal.ZonedDateTime> =
  validators.instance;
