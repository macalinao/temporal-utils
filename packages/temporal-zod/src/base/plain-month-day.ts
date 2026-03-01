import type { z } from "zod";
import type { ZodTemporal } from "./temporal-validator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporal-validator.js";

export const PlainMonthDay: typeof Temporal.PlainMonthDay =
  Temporal.PlainMonthDay;

/**
 * Regex pattern for {@link Temporal.PlainMonthDay} ISO 8601 strings (e.g. `--01-15` or `01-15`).
 * Validates month (01–12) and day (01–31). The `--` prefix is optional per ISO 8601.
 */
export const PLAIN_MONTH_DAY_PATTERN =
  "^(--)?(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$";

const validators = temporalValidators(PlainMonthDay);

/**
 * Validates or coerces a string to a {@link Temporal.PlainMonthDay}.
 */
export const zPlainMonthDay: ZodTemporal<typeof PlainMonthDay> =
  validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.PlainMonthDay}.
 */
export const zPlainMonthDayInstance: z.ZodType<Temporal.PlainMonthDay> =
  validators.instance;
