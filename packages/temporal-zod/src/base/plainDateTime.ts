import type { z } from "zod";
import type { ZodTemporal } from "./temporalValidator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporalValidator.js";

export const PlainDateTime: typeof Temporal.PlainDateTime =
  Temporal.PlainDateTime;

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
