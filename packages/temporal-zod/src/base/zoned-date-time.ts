import type { z } from "zod";
import type { ZodTemporal } from "./temporal-validator.js";
import { Temporal } from "temporal-polyfill";
import {
  DATE_PART,
  OFFSET_PART,
  OPTIONAL_CALENDAR_PART,
  TIME_PART,
  TIME_ZONE_PART,
} from "./iso-pattern-parts.js";
import { temporalValidators } from "./temporal-validator.js";

export const ZonedDateTime: typeof Temporal.ZonedDateTime =
  Temporal.ZonedDateTime;

/**
 * Regex pattern for {@link Temporal.ZonedDateTime} ISO 8601 strings
 * (e.g. `2023-01-15T13:45:30+08:00[Asia/Manila]`).
 * Validates month (01–12), day (01–31), hours (00–23), minutes/seconds (00–59),
 * up to 9 fractional digits, a UTC offset (Z or ±HH:MM), and a required IANA timezone
 * annotation in brackets.
 *
 * The time zone annotation is matched as a single bracket group rather than
 * `\[.+\]`, so it no longer swallows a following `[u-ca=…]` — which is accepted
 * on its own, as `toJSON()` emits it under a non-ISO calendar.
 */
export const ZONED_DATE_TIME_PATTERN: string = `^${DATE_PART}T${TIME_PART}${OFFSET_PART}${TIME_ZONE_PART}${OPTIONAL_CALENDAR_PART}$`;

const validators = temporalValidators(ZonedDateTime);

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
