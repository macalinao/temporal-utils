import type { z } from "zod";
import type { ZodTemporal } from "./temporalValidator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporalValidator.js";

export const Duration: typeof Temporal.Duration = Temporal.Duration;

const validators = temporalValidators(Duration);

/**
 * Validates or coerces a string to a {@link Temporal.Duration}.
 */
export const zDuration: ZodTemporal<typeof Duration> = validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.Duration}.
 */
export const zDurationInstance: z.ZodType<Temporal.Duration> =
  validators.instance;
