import type { z } from "zod";
import type { ZodTemporal } from "./temporal-validator.js";
import { Temporal } from "temporal-polyfill";
import { DATE_PART, OPTIONAL_CALENDAR_PART } from "./iso-pattern-parts.js";
import { temporalValidators } from "./temporal-validator.js";

export const PlainDate: typeof Temporal.PlainDate = Temporal.PlainDate;

/**
 * Regex pattern for {@link Temporal.PlainDate} ISO 8601 strings (e.g. `2023-01-15`).
 * Validates month (01–12) and day (01–31).
 *
 * Also accepts the trailing `[u-ca=…]` annotation that `toJSON()` emits under a
 * non-ISO calendar (e.g. `2023-01-15[u-ca=hebrew]`) and the signed six-digit
 * year form (e.g. `-000753-04-21`).
 */
export const PLAIN_DATE_PATTERN: string = `^${DATE_PART}${OPTIONAL_CALENDAR_PART}$`;

const validators = temporalValidators(PlainDate);

/**
 * Validates or coerces a string to a {@link Temporal.PlainDate}.
 */
export const zPlainDate: ZodTemporal<typeof PlainDate> = validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.PlainDate}.
 */
export const zPlainDateInstance: z.ZodType<Temporal.PlainDate> =
  validators.instance;
