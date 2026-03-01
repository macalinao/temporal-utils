import type { z } from "zod";
import type { ZodTemporal } from "./temporal-validator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporal-validator.js";

export const PlainYearMonth: typeof Temporal.PlainYearMonth =
  Temporal.PlainYearMonth;

/**
 * Regex pattern for {@link Temporal.PlainYearMonth} ISO 8601 strings (e.g. `2023-01`).
 * Validates month (01–12).
 */
export const PLAIN_YEAR_MONTH_PATTERN = "^\\d{4}-(0[1-9]|1[0-2])$";

const validators = temporalValidators(PlainYearMonth);

/**
 * Validates or coerces a string to a {@link Temporal.PlainYearMonth}.
 */
export const zPlainYearMonth: ZodTemporal<typeof PlainYearMonth> =
  validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.PlainYearMonth}.
 */
export const zPlainYearMonthInstance: z.ZodType<Temporal.PlainYearMonth> =
  validators.instance;
