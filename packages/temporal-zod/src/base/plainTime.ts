import type { z } from "zod";
import type { ZodTemporal } from "./temporalValidator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporalValidator.js";

export const PlainTime: typeof Temporal.PlainTime = Temporal.PlainTime;

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
