import type { z } from "zod";
import type { ZodTemporal } from "./temporalValidator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporalValidator.js";

export const PlainYearMonth: typeof Temporal.PlainYearMonth =
  Temporal.PlainYearMonth;

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
