import type { z } from "zod";
import type { ZodTemporal } from "./temporalValidator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporalValidator.js";

export const PlainMonthDay: typeof Temporal.PlainMonthDay =
  Temporal.PlainMonthDay;

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
