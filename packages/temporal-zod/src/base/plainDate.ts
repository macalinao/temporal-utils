import type { z } from "zod";
import type { ZodTemporal } from "./temporalValidator.js";
import { Temporal } from "temporal-polyfill";
import { temporalValidators } from "./temporalValidator.js";

export const PlainDate: typeof Temporal.PlainDate = Temporal.PlainDate;

/**
 * Regex pattern for {@link Temporal.PlainDate} ISO 8601 strings (e.g. `2023-01-15`).
 * Validates month (01–12) and day (01–31).
 */
export const PLAIN_DATE_PATTERN =
  "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$";

const validators = temporalValidators(PlainDate, {
  type: "string",
  id: "PlainDate",
  description: "An ISO 8601 date string without time (e.g. 2023-01-15)",
  format: "date",
});

/**
 * Validates or coerces a string to a {@link Temporal.PlainDate}.
 */
export const zPlainDate: ZodTemporal<typeof PlainDate> = validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.PlainDate}.
 */
export const zPlainDateInstance: z.ZodType<Temporal.PlainDate> =
  validators.instance;
