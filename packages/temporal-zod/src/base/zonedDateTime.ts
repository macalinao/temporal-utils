import type { z } from "zod";
import type { ZodTemporal } from "./temporalValidator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporalValidator.js";

export const ZonedDateTime: typeof Temporal.ZonedDateTime =
  Temporal.ZonedDateTime;

const validators = temporalValidators(ZonedDateTime);

/**
 * Validates or coerces a string to a {@link Temporal.ZonedDateTime}.
 */
export const zZonedDateTime: ZodTemporal<typeof ZonedDateTime> =
  validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.ZonedDateTime}.
 */
export const zZonedDateTimeInstance: z.ZodType<Temporal.ZonedDateTime> =
  validators.instance;
