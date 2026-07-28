import type { z } from "zod";
import type { ZodTemporal } from "./temporal-validator.js";
import { Temporal } from "temporal-polyfill";
import { TIME_PART } from "./iso-pattern-parts.js";
import { temporalValidators } from "./temporal-validator.js";

export const PlainTime: typeof Temporal.PlainTime = Temporal.PlainTime;

/**
 * Regex pattern for {@link Temporal.PlainTime} ISO 8601 strings
 * (e.g. `13:45:30` or `13:45:30.123456789`).
 * Validates hours (00–23), minutes (00–59), seconds (00–59), and up to 9 fractional digits.
 * Note: Unlike RFC 3339 "full-time", PlainTime has no timezone offset.
 *
 * `PlainTime` carries no calendar, so unlike the date-bearing types this takes
 * no `[u-ca=…]` annotation.
 */
export const PLAIN_TIME_PATTERN: string = `^${TIME_PART}$`;

const validators = temporalValidators(PlainTime);

/**
 * Validates or coerces a string to a {@link Temporal.PlainTime}.
 */
export const zPlainTime: ZodTemporal<typeof PlainTime> = validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.PlainTime}.
 */
export const zPlainTimeInstance: z.ZodType<Temporal.PlainTime> =
  validators.instance;
