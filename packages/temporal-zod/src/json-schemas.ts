/**
 * Temporal Zod validators with JSON Schema metadata.
 *
 * This is the main entry point of `temporal-zod`. Every validator exported here
 * is a clone of the corresponding base validator with JSON Schema metadata
 * attached via Zod's `.meta()`, so `z.toJSONSchema()` works out of the box.
 *
 * If you don't need JSON Schema support, import from `temporal-zod/base` instead
 * for a smaller bundle without the metadata registration side effect.
 *
 * @module
 * @see {@link https://github.com/macalinao/temporal-utils/tree/master/packages/temporal-zod | temporal-zod on GitHub}
 */
import type { Temporal } from "temporal-polyfill";
import type * as z from "zod";
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
 * Applies JSON schema metadata to Zod schemas so `z.toJSONSchema()` works.
 *
 * Uses `.meta()` to clone each schema and register metadata in the global
 * registry. The metadata (description, pattern, format) is `Object.assign`ed
 * into the JSON Schema output by Zod's `toJSONSchema()`.
 *
 * Sets `_zod.toJSONSchema` on every clone to prevent "unrepresentable type"
 * errors for instanceof/transform schemas. Only the first schema (coerce)
 * gets `id` in metadata for `$defs/$ref` dedup in composed schemas.
 */
function registerJSONSchema<T extends [z.ZodType, ...z.ZodType[]]>(
  schemas: T,
  jsonSchema: TemporalJSONSchema,
): T {
  const { id, ...metaWithoutId } = jsonSchema;
  return schemas.map((schema, i) => {
    // First schema gets id in metadata for $defs/$ref dedup in composed schemas.
    // Registering multiple schemas with the same id causes "Duplicate schema id"
    // errors when both appear in the same z.object().
    const cloned = schema.meta(i === 0 ? jsonSchema : metaWithoutId);
    // Override to prevent "unrepresentable type" errors for instanceof/transform
    // schemas. Include id so standalone conversion includes it for all schemas.
    cloned._zod.toJSONSchema = () => ({ type: jsonSchema.type, id });
    // Clear parent ref set by clone() — the original schema won't be in the
    // toJSONSchema seen map, which causes flattenRef to crash.
    cloned._zod.parent = undefined;
    return cloned;
  }) as unknown as T;
}

// Avoid destructured exports (`const [a, b] = ...`) which are incompatible
// with --isolatedDeclarations. Use indexed access with explicit type annotations.

const _instant = registerJSONSchema([zInstantBase, zInstantInstanceBase], {
  type: "string",
  id: "Temporal.Instant",
  description:
    "An ISO 8601 instant string with a required UTC offset (e.g. 2023-01-15T13:45:30Z)",
  format: "date-time",
  pattern: INSTANT_PATTERN,
});
/**
 * Validates or coerces a string or `Date` to a {@link Temporal.Instant}.
 *
 * Accepts ISO 8601 instant strings with a required UTC offset
 * (e.g. `2023-01-15T13:45:30Z`), `Date` objects, or existing `Instant` instances.
 *
 * Includes JSON Schema metadata (`format: "date-time"`, `pattern`, `description`)
 * so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zInstant: z.ZodType<Temporal.Instant> = _instant[0];
/**
 * Validates that the value is an instance of {@link Temporal.Instant}.
 *
 * Unlike {@link zInstant}, this does **not** coerce strings or `Date` objects.
 * Use this when you expect a pre-parsed `Temporal.Instant` instance.
 *
 * Includes JSON Schema metadata so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zInstantInstance: z.ZodType<Temporal.Instant> = _instant[1];

const _plainDate = registerJSONSchema(
  [zPlainDateBase, zPlainDateInstanceBase],
  {
    type: "string",
    id: "Temporal.PlainDate",
    description: "An ISO 8601 date string without time (e.g. 2023-01-15)",
    format: "date",
    pattern: PLAIN_DATE_PATTERN,
  },
);
/**
 * Validates or coerces a string to a {@link Temporal.PlainDate}.
 *
 * Accepts ISO 8601 date strings without time (e.g. `2023-01-15`)
 * or existing `PlainDate` instances.
 *
 * Includes JSON Schema metadata (`format: "date"`, `pattern`, `description`)
 * so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zPlainDate: z.ZodType<Temporal.PlainDate> = _plainDate[0];
/**
 * Validates that the value is an instance of {@link Temporal.PlainDate}.
 *
 * Unlike {@link zPlainDate}, this does **not** coerce strings.
 * Use this when you expect a pre-parsed `Temporal.PlainDate` instance.
 *
 * Includes JSON Schema metadata so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zPlainDateInstance: z.ZodType<Temporal.PlainDate> = _plainDate[1];

const _plainTime = registerJSONSchema(
  [zPlainTimeBase, zPlainTimeInstanceBase],
  {
    type: "string",
    id: "Temporal.PlainTime",
    description:
      "An ISO 8601 time string without date or timezone (e.g. 13:45:30)",
    pattern: PLAIN_TIME_PATTERN,
  },
);
/**
 * Validates or coerces a string to a {@link Temporal.PlainTime}.
 *
 * Accepts ISO 8601 time strings without date or timezone
 * (e.g. `13:45:30`, `13:45:30.123456789`) or existing `PlainTime` instances.
 *
 * Includes JSON Schema metadata (`pattern`, `description`)
 * so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zPlainTime: z.ZodType<Temporal.PlainTime> = _plainTime[0];
/**
 * Validates that the value is an instance of {@link Temporal.PlainTime}.
 *
 * Unlike {@link zPlainTime}, this does **not** coerce strings.
 * Use this when you expect a pre-parsed `Temporal.PlainTime` instance.
 *
 * Includes JSON Schema metadata so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zPlainTimeInstance: z.ZodType<Temporal.PlainTime> = _plainTime[1];

const _plainDateTime = registerJSONSchema(
  [zPlainDateTimeBase, zPlainDateTimeInstanceBase],
  {
    type: "string",
    id: "Temporal.PlainDateTime",
    description:
      "An ISO 8601 date-time string without timezone (e.g. 2023-01-15T13:45:30)",
    pattern: PLAIN_DATE_TIME_PATTERN,
  },
);
/**
 * Validates or coerces a string to a {@link Temporal.PlainDateTime}.
 *
 * Accepts ISO 8601 date-time strings without timezone
 * (e.g. `2023-01-15T13:45:30`) or existing `PlainDateTime` instances.
 *
 * Includes JSON Schema metadata (`pattern`, `description`)
 * so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zPlainDateTime: z.ZodType<Temporal.PlainDateTime> = _plainDateTime[0];
/**
 * Validates that the value is an instance of {@link Temporal.PlainDateTime}.
 *
 * Unlike {@link zPlainDateTime}, this does **not** coerce strings.
 * Use this when you expect a pre-parsed `Temporal.PlainDateTime` instance.
 *
 * Includes JSON Schema metadata so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zPlainDateTimeInstance: z.ZodType<Temporal.PlainDateTime> =
  _plainDateTime[1];

const _plainYearMonth = registerJSONSchema(
  [zPlainYearMonthBase, zPlainYearMonthInstanceBase],
  {
    type: "string",
    id: "Temporal.PlainYearMonth",
    description: "An ISO 8601 year-month string (e.g. 2023-01)",
    pattern: PLAIN_YEAR_MONTH_PATTERN,
  },
);
/**
 * Validates or coerces a string to a {@link Temporal.PlainYearMonth}.
 *
 * Accepts ISO 8601 year-month strings (e.g. `2023-01`)
 * or existing `PlainYearMonth` instances.
 *
 * Includes JSON Schema metadata (`pattern`, `description`)
 * so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zPlainYearMonth: z.ZodType<Temporal.PlainYearMonth> = _plainYearMonth[0];
/**
 * Validates that the value is an instance of {@link Temporal.PlainYearMonth}.
 *
 * Unlike {@link zPlainYearMonth}, this does **not** coerce strings.
 * Use this when you expect a pre-parsed `Temporal.PlainYearMonth` instance.
 *
 * Includes JSON Schema metadata so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zPlainYearMonthInstance: z.ZodType<Temporal.PlainYearMonth> =
  _plainYearMonth[1];

const _plainMonthDay = registerJSONSchema(
  [zPlainMonthDayBase, zPlainMonthDayInstanceBase],
  {
    type: "string",
    id: "Temporal.PlainMonthDay",
    description: "An ISO 8601 month-day string (e.g. --01-15 or 01-15)",
    pattern: PLAIN_MONTH_DAY_PATTERN,
  },
);
/**
 * Validates or coerces a string to a {@link Temporal.PlainMonthDay}.
 *
 * Accepts ISO 8601 month-day strings (e.g. `--01-15` or `01-15`)
 * or existing `PlainMonthDay` instances.
 *
 * Includes JSON Schema metadata (`pattern`, `description`)
 * so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zPlainMonthDay: z.ZodType<Temporal.PlainMonthDay> = _plainMonthDay[0];
/**
 * Validates that the value is an instance of {@link Temporal.PlainMonthDay}.
 *
 * Unlike {@link zPlainMonthDay}, this does **not** coerce strings.
 * Use this when you expect a pre-parsed `Temporal.PlainMonthDay` instance.
 *
 * Includes JSON Schema metadata so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zPlainMonthDayInstance: z.ZodType<Temporal.PlainMonthDay> =
  _plainMonthDay[1];

const _zonedDateTime = registerJSONSchema(
  [zZonedDateTimeBase, zZonedDateTimeInstanceBase],
  {
    type: "string",
    id: "Temporal.ZonedDateTime",
    description:
      "An ISO 8601 date-time string with timezone offset and IANA annotation (e.g. 2023-01-15T13:45:30+08:00[Asia/Manila])",
    pattern: ZONED_DATE_TIME_PATTERN,
  },
);
/**
 * Validates or coerces a string to a {@link Temporal.ZonedDateTime}.
 *
 * Accepts ISO 8601 date-time strings with a timezone offset and IANA timezone
 * annotation (e.g. `2023-01-15T13:45:30+08:00[Asia/Manila]`)
 * or existing `ZonedDateTime` instances.
 *
 * Includes JSON Schema metadata (`pattern`, `description`)
 * so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zZonedDateTime: z.ZodType<Temporal.ZonedDateTime> = _zonedDateTime[0];
/**
 * Validates that the value is an instance of {@link Temporal.ZonedDateTime}.
 *
 * Unlike {@link zZonedDateTime}, this does **not** coerce strings.
 * Use this when you expect a pre-parsed `Temporal.ZonedDateTime` instance.
 *
 * Includes JSON Schema metadata so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zZonedDateTimeInstance: z.ZodType<Temporal.ZonedDateTime> =
  _zonedDateTime[1];

const _duration = registerJSONSchema([zDurationBase, zDurationInstanceBase], {
  type: "string",
  id: "Temporal.Duration",
  description: "An ISO 8601 duration string (e.g. PT1H30M, P1Y2M3D)",
  format: "duration",
  pattern: DURATION_PATTERN,
});
/**
 * Validates or coerces a string to a {@link Temporal.Duration}.
 *
 * Accepts ISO 8601 duration strings (e.g. `PT1H30M`, `P1Y2M3D`)
 * or existing `Duration` instances.
 *
 * Includes JSON Schema metadata (`format: "duration"`, `pattern`, `description`)
 * so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zDuration: z.ZodType<Temporal.Duration> = _duration[0];
/**
 * Validates that the value is an instance of {@link Temporal.Duration}.
 *
 * Unlike {@link zDuration}, this does **not** coerce strings.
 * Use this when you expect a pre-parsed `Temporal.Duration` instance.
 *
 * Includes JSON Schema metadata so `z.toJSONSchema()` produces a correct JSON Schema.
 */
const zDurationInstance: z.ZodType<Temporal.Duration> = _duration[1];

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
