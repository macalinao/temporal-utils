import type { z } from "zod";
import type { ZodTemporal } from "./temporal-validator.js";
import { Temporal } from "temporal-polyfill";
import {
  DATE_PART,
  OPTIONAL_CALENDAR_PART,
  TIME_PART,
} from "./iso-pattern-parts.js";
import { temporalValidators } from "./temporal-validator.js";

export const PlainDateTime: typeof Temporal.PlainDateTime =
  Temporal.PlainDateTime;

/**
 * Regex pattern for {@link Temporal.PlainDateTime} ISO 8601 strings (e.g. `2023-01-15T13:45:30`).
 * Validates month (01–12), day (01–31), hours (00–23), minutes/seconds (00–59),
 * and up to 9 fractional digits. No timezone offset.
 *
 * Also accepts the trailing `[u-ca=…]` annotation that `toJSON()` emits under a
 * non-ISO calendar (e.g. `2023-01-15T13:45:30[u-ca=hebrew]`).
 */
export const PLAIN_DATE_TIME_PATTERN: string = `^${DATE_PART}T${TIME_PART}${OPTIONAL_CALENDAR_PART}$`;

const validators = temporalValidators(PlainDateTime);

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
