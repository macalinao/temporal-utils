import type { z } from "zod";
import type { ZodTemporal } from "./temporalValidator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporalValidator.js";

export const PlainDate: typeof Temporal.PlainDate = Temporal.PlainDate;

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
