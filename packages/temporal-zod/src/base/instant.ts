import { Temporal } from "temporal-polyfill";
import * as z from "zod";
import {
  DATE_PART,
  OFFSET_PART,
  OPTIONAL_CALENDAR_PART,
  TIME_PART,
  TIME_ZONE_PART,
} from "./iso-pattern-parts.js";
import { temporalValidators } from "./temporal-validator.js";

export const Instant: typeof Temporal.Instant = Temporal.Instant;

/**
 * Regex pattern for {@link Temporal.Instant} ISO 8601 strings
 * (e.g. `2023-01-15T13:45:30Z` or `2023-01-15T13:45:30+05:30`).
 * Validates month (01–12), day (01–31), hours (00–23), minutes/seconds (00–59),
 * up to 9 fractional digits, and a required UTC offset (Z or ±HH:MM).
 * An optional IANA timezone annotation in brackets is permitted.
 *
 * The annotations are matched as distinct bracket groups rather than `\[.+\]`,
 * so a `[u-ca=…]` suffix is recognized instead of being absorbed by the time
 * zone group.
 */
export const INSTANT_PATTERN: string = `^${DATE_PART}T${TIME_PART}${OFFSET_PART}(${TIME_ZONE_PART})?${OPTIONAL_CALENDAR_PART}$`;

const validators = temporalValidators(Instant, [
  z
    .date()
    .transform((value) =>
      Temporal.Instant.fromEpochMilliseconds(value.getTime()),
    ),
]);

/**
 * Validates or coerces a string or Date to a {@link Temporal.Instant}.
 */
export const zInstant: z.ZodType<Temporal.Instant> = validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.Instant}.
 */
export const zInstantInstance: z.ZodType<Temporal.Instant> =
  validators.instance;
