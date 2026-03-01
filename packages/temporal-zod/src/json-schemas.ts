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

const [zInstant, zInstantInstance] = registerJSONSchema(
  [zInstantBase, zInstantInstanceBase],
  {
    type: "string",
    id: "Temporal.Instant",
    description:
      "An ISO 8601 instant string with a required UTC offset (e.g. 2023-01-15T13:45:30Z)",
    format: "date-time",
    pattern: INSTANT_PATTERN,
  },
);

const [zPlainDate, zPlainDateInstance] = registerJSONSchema(
  [zPlainDateBase, zPlainDateInstanceBase],
  {
    type: "string",
    id: "Temporal.PlainDate",
    description: "An ISO 8601 date string without time (e.g. 2023-01-15)",
    format: "date",
    pattern: PLAIN_DATE_PATTERN,
  },
);

const [zPlainTime, zPlainTimeInstance] = registerJSONSchema(
  [zPlainTimeBase, zPlainTimeInstanceBase],
  {
    type: "string",
    id: "Temporal.PlainTime",
    description:
      "An ISO 8601 time string without date or timezone (e.g. 13:45:30)",
    pattern: PLAIN_TIME_PATTERN,
  },
);

const [zPlainDateTime, zPlainDateTimeInstance] = registerJSONSchema(
  [zPlainDateTimeBase, zPlainDateTimeInstanceBase],
  {
    type: "string",
    id: "Temporal.PlainDateTime",
    description:
      "An ISO 8601 date-time string without timezone (e.g. 2023-01-15T13:45:30)",
    pattern: PLAIN_DATE_TIME_PATTERN,
  },
);

const [zPlainYearMonth, zPlainYearMonthInstance] = registerJSONSchema(
  [zPlainYearMonthBase, zPlainYearMonthInstanceBase],
  {
    type: "string",
    id: "Temporal.PlainYearMonth",
    description: "An ISO 8601 year-month string (e.g. 2023-01)",
    pattern: PLAIN_YEAR_MONTH_PATTERN,
  },
);

const [zPlainMonthDay, zPlainMonthDayInstance] = registerJSONSchema(
  [zPlainMonthDayBase, zPlainMonthDayInstanceBase],
  {
    type: "string",
    id: "Temporal.PlainMonthDay",
    description: "An ISO 8601 month-day string (e.g. --01-15 or 01-15)",
    pattern: PLAIN_MONTH_DAY_PATTERN,
  },
);

const [zZonedDateTime, zZonedDateTimeInstance] = registerJSONSchema(
  [zZonedDateTimeBase, zZonedDateTimeInstanceBase],
  {
    type: "string",
    id: "Temporal.ZonedDateTime",
    description:
      "An ISO 8601 date-time string with timezone offset and IANA annotation (e.g. 2023-01-15T13:45:30+08:00[Asia/Manila])",
    pattern: ZONED_DATE_TIME_PATTERN,
  },
);

const [zDuration, zDurationInstance] = registerJSONSchema(
  [zDurationBase, zDurationInstanceBase],
  {
    type: "string",
    id: "Temporal.Duration",
    description: "An ISO 8601 duration string (e.g. PT1H30M, P1Y2M3D)",
    format: "duration",
    pattern: DURATION_PATTERN,
  },
);

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
