/**
 * Temporal Zod validators with JSON Schema metadata.
 *
 * This is the main entry point of `temporal-zod`. Every validator exported here
 * is a clone of the corresponding base validator with JSON Schema metadata
 * attached via Zod's `.meta()`, so `z.toJSONSchema()` works out of the box. Each
 * validator also has an `.error({ error })` method for customizing the error.
 *
 * If you don't need JSON Schema support, import from `temporal-zod/base` instead
 * for a smaller bundle without the metadata registration side effect.
 *
 * @module
 * @see {@link https://github.com/macalinao/temporal-utils/tree/master/packages/temporal-zod | temporal-zod on GitHub}
 */
import type { Temporal } from "temporal-polyfill";
import type * as z from "zod";
import type { WithError } from "./base/index.js";
import {
  DURATION_PATTERN,
  INSTANT_PATTERN,
  PLAIN_DATE_PATTERN,
  PLAIN_DATE_TIME_PATTERN,
  PLAIN_MONTH_DAY_PATTERN,
  PLAIN_TIME_PATTERN,
  PLAIN_YEAR_MONTH_PATTERN,
  ZONED_DATE_TIME_PATTERN,
  zDuration as zDurationBase,
  zDurationInstance as zDurationInstanceBase,
  zInstant as zInstantBase,
  zInstantInstance as zInstantInstanceBase,
  zPlainDate as zPlainDateBase,
  zPlainDateInstance as zPlainDateInstanceBase,
  zPlainDateTime as zPlainDateTimeBase,
  zPlainDateTimeInstance as zPlainDateTimeInstanceBase,
  zPlainMonthDay as zPlainMonthDayBase,
  zPlainMonthDayInstance as zPlainMonthDayInstanceBase,
  zPlainTime as zPlainTimeBase,
  zPlainTimeInstance as zPlainTimeInstanceBase,
  zPlainYearMonth as zPlainYearMonthBase,
  zPlainYearMonthInstance as zPlainYearMonthInstanceBase,
  zZonedDateTime as zZonedDateTimeBase,
  zZonedDateTimeInstance as zZonedDateTimeInstanceBase,
} from "./base/index.js";
import { withError } from "./base/temporal-validator.js";

/**
 * Shape of the JSON Schema metadata attached to each Temporal validator.
 */
interface TemporalJSONSchema {
  type: "string";
  id: string;
  description: string;
  pattern?: string;
  format?: string;
}

/**
 * Attaches JSON Schema metadata to a Zod schema clone.
 *
 * Uses `.meta()` to register metadata in the global registry (the description,
 * pattern, and format are `Object.assign`ed into the `toJSONSchema()` output).
 * Sets `_zod.toJSONSchema` to prevent "unrepresentable type" errors for
 * instanceof/transform schemas, and clears the cloned `_zod.parent` (which would
 * otherwise crash `flattenRef`, since the original isn't in the seen map).
 *
 * @param withId - When `true`, the metadata includes `id` so the schema registers
 *   a reusable `$def`. Only the default coerce validator does this; instance and
 *   custom-error variants omit it (registering a duplicate id throws), so they
 *   reference that `$def` via `$ref` (or inline an equivalent schema).
 */
function decorateJSONSchema<O>(
  schema: z.ZodType<O>,
  jsonSchema: TemporalJSONSchema,
  withId: boolean,
): z.ZodType<O> {
  const { id, ...metaWithoutId } = jsonSchema;
  const cloned = schema.meta(withId ? jsonSchema : metaWithoutId);
  cloned._zod.toJSONSchema = () => ({ type: jsonSchema.type, id });
  cloned._zod.parent = undefined;
  return cloned;
}

/**
 * Wraps a base validator with JSON Schema metadata, preserving its `.error()`
 * method. The default is decorated once (the coerce validator registers the
 * reusable `$def`); `.error({ error })` rebuilds from the base validator's own
 * `.error()` and re-applies the metadata.
 */
function jsonValidator<O>(
  base: WithError<z.ZodType<O>>,
  jsonSchema: TemporalJSONSchema,
  isCoerce: boolean,
): WithError<z.ZodType<O>> {
  return withError<z.ZodType<O>>((error) =>
    decorateJSONSchema(
      error === undefined ? base : base.error({ error }),
      jsonSchema,
      error === undefined && isCoerce,
    ),
  );
}

const INSTANT_JSON_SCHEMA: TemporalJSONSchema = {
  type: "string",
  id: "Temporal.Instant",
  description:
    "An ISO 8601 instant string with a required UTC offset (e.g. 2023-01-15T13:45:30Z)",
  format: "date-time",
  pattern: INSTANT_PATTERN,
};
/**
 * Validates or coerces a string or `Date` to a {@link Temporal.Instant}.
 *
 * Use it directly, or call `.error({ error })` for a copy with a custom error.
 * Includes JSON Schema metadata so `z.toJSONSchema()` works.
 */
const zInstant: WithError<z.ZodType<Temporal.Instant>> = jsonValidator(
  zInstantBase,
  INSTANT_JSON_SCHEMA,
  true,
);
/**
 * Validates that the value is an instance of {@link Temporal.Instant}.
 *
 * Unlike {@link zInstant}, this does **not** coerce strings or `Date` objects.
 */
const zInstantInstance: WithError<z.ZodType<Temporal.Instant>> = jsonValidator(
  zInstantInstanceBase,
  INSTANT_JSON_SCHEMA,
  false,
);

const PLAIN_DATE_JSON_SCHEMA: TemporalJSONSchema = {
  type: "string",
  id: "Temporal.PlainDate",
  description: "An ISO 8601 date string without time (e.g. 2023-01-15)",
  format: "date",
  pattern: PLAIN_DATE_PATTERN,
};
/**
 * Validates or coerces a string to a {@link Temporal.PlainDate}.
 *
 * Use it directly, or call `.error({ error })` for a copy with a custom error.
 * Includes JSON Schema metadata so `z.toJSONSchema()` works.
 */
const zPlainDate: WithError<z.ZodType<Temporal.PlainDate>> = jsonValidator(
  zPlainDateBase,
  PLAIN_DATE_JSON_SCHEMA,
  true,
);
/**
 * Validates that the value is an instance of {@link Temporal.PlainDate}.
 */
const zPlainDateInstance: WithError<z.ZodType<Temporal.PlainDate>> =
  jsonValidator(zPlainDateInstanceBase, PLAIN_DATE_JSON_SCHEMA, false);

const PLAIN_TIME_JSON_SCHEMA: TemporalJSONSchema = {
  type: "string",
  id: "Temporal.PlainTime",
  description:
    "An ISO 8601 time string without date or timezone (e.g. 13:45:30)",
  pattern: PLAIN_TIME_PATTERN,
};
/**
 * Validates or coerces a string to a {@link Temporal.PlainTime}.
 *
 * Use it directly, or call `.error({ error })` for a copy with a custom error.
 * Includes JSON Schema metadata so `z.toJSONSchema()` works.
 */
const zPlainTime: WithError<z.ZodType<Temporal.PlainTime>> = jsonValidator(
  zPlainTimeBase,
  PLAIN_TIME_JSON_SCHEMA,
  true,
);
/**
 * Validates that the value is an instance of {@link Temporal.PlainTime}.
 */
const zPlainTimeInstance: WithError<z.ZodType<Temporal.PlainTime>> =
  jsonValidator(zPlainTimeInstanceBase, PLAIN_TIME_JSON_SCHEMA, false);

const PLAIN_DATE_TIME_JSON_SCHEMA: TemporalJSONSchema = {
  type: "string",
  id: "Temporal.PlainDateTime",
  description:
    "An ISO 8601 date-time string without timezone (e.g. 2023-01-15T13:45:30)",
  pattern: PLAIN_DATE_TIME_PATTERN,
};
/**
 * Validates or coerces a string to a {@link Temporal.PlainDateTime}.
 *
 * Use it directly, or call `.error({ error })` for a copy with a custom error.
 * Includes JSON Schema metadata so `z.toJSONSchema()` works.
 */
const zPlainDateTime: WithError<z.ZodType<Temporal.PlainDateTime>> =
  jsonValidator(zPlainDateTimeBase, PLAIN_DATE_TIME_JSON_SCHEMA, true);
/**
 * Validates that the value is an instance of {@link Temporal.PlainDateTime}.
 */
const zPlainDateTimeInstance: WithError<z.ZodType<Temporal.PlainDateTime>> =
  jsonValidator(zPlainDateTimeInstanceBase, PLAIN_DATE_TIME_JSON_SCHEMA, false);

const PLAIN_YEAR_MONTH_JSON_SCHEMA: TemporalJSONSchema = {
  type: "string",
  id: "Temporal.PlainYearMonth",
  description: "An ISO 8601 year-month string (e.g. 2023-01)",
  pattern: PLAIN_YEAR_MONTH_PATTERN,
};
/**
 * Validates or coerces a string to a {@link Temporal.PlainYearMonth}.
 *
 * Use it directly, or call `.error({ error })` for a copy with a custom error.
 * Includes JSON Schema metadata so `z.toJSONSchema()` works.
 */
const zPlainYearMonth: WithError<z.ZodType<Temporal.PlainYearMonth>> =
  jsonValidator(zPlainYearMonthBase, PLAIN_YEAR_MONTH_JSON_SCHEMA, true);
/**
 * Validates that the value is an instance of {@link Temporal.PlainYearMonth}.
 */
const zPlainYearMonthInstance: WithError<z.ZodType<Temporal.PlainYearMonth>> =
  jsonValidator(
    zPlainYearMonthInstanceBase,
    PLAIN_YEAR_MONTH_JSON_SCHEMA,
    false,
  );

const PLAIN_MONTH_DAY_JSON_SCHEMA: TemporalJSONSchema = {
  type: "string",
  id: "Temporal.PlainMonthDay",
  description: "An ISO 8601 month-day string (e.g. --01-15 or 01-15)",
  pattern: PLAIN_MONTH_DAY_PATTERN,
};
/**
 * Validates or coerces a string to a {@link Temporal.PlainMonthDay}.
 *
 * Use it directly, or call `.error({ error })` for a copy with a custom error.
 * Includes JSON Schema metadata so `z.toJSONSchema()` works.
 */
const zPlainMonthDay: WithError<z.ZodType<Temporal.PlainMonthDay>> =
  jsonValidator(zPlainMonthDayBase, PLAIN_MONTH_DAY_JSON_SCHEMA, true);
/**
 * Validates that the value is an instance of {@link Temporal.PlainMonthDay}.
 */
const zPlainMonthDayInstance: WithError<z.ZodType<Temporal.PlainMonthDay>> =
  jsonValidator(zPlainMonthDayInstanceBase, PLAIN_MONTH_DAY_JSON_SCHEMA, false);

const ZONED_DATE_TIME_JSON_SCHEMA: TemporalJSONSchema = {
  type: "string",
  id: "Temporal.ZonedDateTime",
  description:
    "An ISO 8601 date-time string with timezone offset and IANA annotation (e.g. 2023-01-15T13:45:30+08:00[Asia/Manila])",
  pattern: ZONED_DATE_TIME_PATTERN,
};
/**
 * Validates or coerces a string to a {@link Temporal.ZonedDateTime}.
 *
 * Use it directly, or call `.error({ error })` for a copy with a custom error.
 * Includes JSON Schema metadata so `z.toJSONSchema()` works.
 */
const zZonedDateTime: WithError<z.ZodType<Temporal.ZonedDateTime>> =
  jsonValidator(zZonedDateTimeBase, ZONED_DATE_TIME_JSON_SCHEMA, true);
/**
 * Validates that the value is an instance of {@link Temporal.ZonedDateTime}.
 */
const zZonedDateTimeInstance: WithError<z.ZodType<Temporal.ZonedDateTime>> =
  jsonValidator(zZonedDateTimeInstanceBase, ZONED_DATE_TIME_JSON_SCHEMA, false);

const DURATION_JSON_SCHEMA: TemporalJSONSchema = {
  type: "string",
  id: "Temporal.Duration",
  description: "An ISO 8601 duration string (e.g. PT1H30M, P1Y2M3D)",
  format: "duration",
  pattern: DURATION_PATTERN,
};
/**
 * Validates or coerces a string to a {@link Temporal.Duration}.
 *
 * Use it directly, or call `.error({ error })` for a copy with a custom error.
 * Includes JSON Schema metadata so `z.toJSONSchema()` works.
 */
const zDuration: WithError<z.ZodType<Temporal.Duration>> = jsonValidator(
  zDurationBase,
  DURATION_JSON_SCHEMA,
  true,
);
/**
 * Validates that the value is an instance of {@link Temporal.Duration}.
 */
const zDurationInstance: WithError<z.ZodType<Temporal.Duration>> =
  jsonValidator(zDurationInstanceBase, DURATION_JSON_SCHEMA, false);

export {
  zDuration,
  zDurationInstance,
  zInstant,
  zInstantInstance,
  zPlainDate,
  zPlainDateInstance,
  zPlainDateTime,
  zPlainDateTimeInstance,
  zPlainMonthDay,
  zPlainMonthDayInstance,
  zPlainTime,
  zPlainTimeInstance,
  zPlainYearMonth,
  zPlainYearMonthInstance,
  zZonedDateTime,
  zZonedDateTimeInstance,
};

// Re-export patterns, types, and other base exports.
// Explicit named exports above shadow the wildcard re-exports for validators.
export * from "./base/index.js";
