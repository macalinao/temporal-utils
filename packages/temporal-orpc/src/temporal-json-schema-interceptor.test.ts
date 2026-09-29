import { describe, expect, test } from "bun:test";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Temporal } from "ponyfill-temporal";
import {
  DURATION_PATTERN,
  INSTANT_PATTERN,
  PLAIN_DATE_PATTERN,
  PLAIN_DATE_TIME_PATTERN,
  PLAIN_MONTH_DAY_PATTERN,
  PLAIN_TIME_PATTERN,
  PLAIN_YEAR_MONTH_PATTERN,
  temporalRegistry,
  ZONED_DATE_TIME_PATTERN,
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
} from "temporal-zod";
import { zInstant as zInstantBase } from "temporal-zod/base";
import * as z from "zod";
import { temporalJsonSchemaInterceptor } from "./temporal-json-schema-interceptor.js";

const converter = new ZodToJsonSchemaConverter({
  interceptors: [temporalJsonSchemaInterceptor],
});
// Without the interceptor, to prove it is what fixes the output.
const bareConverter = new ZodToJsonSchemaConverter();

function convert(schema: z.ZodType): Record<string, unknown> {
  const [, json] = converter.convert(schema, { strategy: "input" });
  return json as Record<string, unknown>;
}

describe("temporalJsonSchemaInterceptor", () => {
  test("zInstant converts to a clean string schema with format + pattern", () => {
    expect(convert(zInstant)).toEqual({
      type: "string",
      description:
        "An ISO 8601 instant string with a required UTC offset (e.g. 2023-01-15T13:45:30Z)",
      format: "date-time",
      pattern: INSTANT_PATTERN,
    });
  });

  test("instance variant is fixed too (no id in metadata)", () => {
    expect(convert(zInstantInstance)).toEqual({
      type: "string",
      description:
        "An ISO 8601 instant string with a required UTC offset (e.g. 2023-01-15T13:45:30Z)",
      format: "date-time",
      pattern: INSTANT_PATTERN,
    });
  });

  test("no leftover anyOf and no dangling $ref/id", () => {
    const json = convert(zPlainDate);
    expect(json).not.toHaveProperty("anyOf");
    expect(json).not.toHaveProperty("$ref");
    expect(json).not.toHaveProperty("id");
    expect(json).toMatchObject({
      type: "string",
      format: "date",
      pattern: PLAIN_DATE_PATTERN,
    });
  });

  test("types without a format omit it", () => {
    const json = convert(zPlainTime);
    expect(json).not.toHaveProperty("format");
    expect(json.type).toBe("string");
  });

  test("format: duration is preserved", () => {
    expect(convert(zDuration)).toMatchObject({
      type: "string",
      format: "duration",
      pattern: DURATION_PATTERN,
    });
  });

  test("works inside a z.object()", () => {
    const [, json] = converter.convert(
      z.object({ start: zInstant, span: zDuration }),
      { strategy: "input" },
    );
    expect(json).toMatchObject({
      type: "object",
      properties: {
        start: { type: "string", format: "date-time" },
        span: { type: "string", format: "duration" },
      },
      required: ["start", "span"],
    });
  });

  test("bare converter (no interceptor) produces the broken anyOf output", () => {
    const [, json] = bareConverter.convert(zInstant, { strategy: "input" });
    // Demonstrates why the interceptor is needed: oRPC walks the underlying
    // z.union and loses the format/pattern metadata.
    expect(json).toHaveProperty("anyOf");
    expect(json).not.toHaveProperty("format");
  });

  test("does not touch schemas whose meta has no JSON Schema type", () => {
    const plain = z.string().meta({ examples: ["hello"] });
    const [, json] = converter.convert(plain, { strategy: "input" });
    expect(json).toMatchObject({ type: "string", examples: ["hello"] });
  });

  test("does not touch a base validator, which carries no metadata", () => {
    const [, json] = converter.convert(zInstantBase, { strategy: "input" });
    // Same output as the bare converter: the interceptor declined to act.
    expect(json).toEqual(
      bareConverter.convert(zInstantBase, { strategy: "input" })[1],
    );
  });

  // The four types above (Instant, PlainDate, PlainTime, Duration) left these
  // unchecked against the real converter.

  test("zZonedDateTime converts to a clean string schema", () => {
    expect(convert(zZonedDateTime)).toEqual({
      type: "string",
      description:
        "An ISO 8601 date-time string with timezone offset and IANA annotation (e.g. 2023-01-15T13:45:30+08:00[Asia/Manila])",
      pattern: ZONED_DATE_TIME_PATTERN,
    });
  });

  test("zPlainDateTime converts to a clean string schema", () => {
    expect(convert(zPlainDateTime)).toEqual({
      type: "string",
      description:
        "An ISO 8601 date-time string without timezone (e.g. 2023-01-15T13:45:30)",
      pattern: PLAIN_DATE_TIME_PATTERN,
    });
  });

  test("zPlainYearMonth converts to a clean string schema", () => {
    expect(convert(zPlainYearMonth)).toEqual({
      type: "string",
      description: "An ISO 8601 year-month string (e.g. 2023-01)",
      pattern: PLAIN_YEAR_MONTH_PATTERN,
    });
  });

  test("zPlainMonthDay converts to a clean string schema", () => {
    expect(convert(zPlainMonthDay)).toEqual({
      type: "string",
      description: "An ISO 8601 month-day string (e.g. --01-15 or 01-15)",
      pattern: PLAIN_MONTH_DAY_PATTERN,
    });
  });

  test("the four remaining instance variants convert too", () => {
    for (const schema of [
      zZonedDateTimeInstance,
      zPlainDateTimeInstance,
      zPlainYearMonthInstance,
      zPlainMonthDayInstance,
    ]) {
      const json = convert(schema);

      expect(json.type).toBe("string");
      expect(json).not.toHaveProperty("anyOf");
      expect(json).not.toHaveProperty("id");
    }
  });
});

/**
 * The interceptor is registry-driven rather than per-type, so it should cover
 * every Temporal type rather than just the handful spot-checked above. These
 * cases pin that down for all eight, in both the coercing and instance
 * variants, and check the wire round trip each type actually goes through:
 * the server serializes with `toJSON()` and the client revives the string by
 * parsing it with the same validator.
 */
const zoned = Temporal.ZonedDateTime.from(
  "2023-01-15T13:45:30+08:00[Asia/Manila]",
);

interface TemporalTypeCase {
  name: string;
  coerce: z.ZodType;
  instance: z.ZodType;
  pattern: string;
  format?: string;
  /** A representative value a server would send. */
  value: { toJSON: () => string };
}

const ALL_TEMPORAL_TYPES: TemporalTypeCase[] = [
  {
    name: "Instant",
    coerce: zInstant,
    instance: zInstantInstance,
    pattern: INSTANT_PATTERN,
    format: "date-time",
    value: Temporal.Instant.from("2022-01-28T18:53:00.123456789Z"),
  },
  {
    name: "ZonedDateTime",
    coerce: zZonedDateTime,
    instance: zZonedDateTimeInstance,
    pattern: ZONED_DATE_TIME_PATTERN,
    value: zoned,
  },
  {
    name: "PlainDate",
    coerce: zPlainDate,
    instance: zPlainDateInstance,
    pattern: PLAIN_DATE_PATTERN,
    format: "date",
    value: zoned.toPlainDate(),
  },
  {
    name: "PlainTime",
    coerce: zPlainTime,
    instance: zPlainTimeInstance,
    pattern: PLAIN_TIME_PATTERN,
    value: Temporal.PlainTime.from("01:02:03.123456789"),
  },
  {
    name: "PlainDateTime",
    coerce: zPlainDateTime,
    instance: zPlainDateTimeInstance,
    pattern: PLAIN_DATE_TIME_PATTERN,
    value: zoned.toPlainDateTime(),
  },
  {
    name: "PlainYearMonth",
    coerce: zPlainYearMonth,
    instance: zPlainYearMonthInstance,
    pattern: PLAIN_YEAR_MONTH_PATTERN,
    value: zoned.toPlainDate().toPlainYearMonth(),
  },
  {
    name: "PlainMonthDay",
    coerce: zPlainMonthDay,
    instance: zPlainMonthDayInstance,
    pattern: PLAIN_MONTH_DAY_PATTERN,
    value: zoned.toPlainDate().toPlainMonthDay(),
  },
  {
    name: "Duration",
    coerce: zDuration,
    instance: zDurationInstance,
    pattern: DURATION_PATTERN,
    format: "duration",
    value: Temporal.Duration.from("-P1Y2M3DT4H5M6.789S"),
  },
];

describe("temporalJsonSchemaInterceptor covers every Temporal type", () => {
  test("the case list is exhaustive", () => {
    expect(ALL_TEMPORAL_TYPES).toHaveLength(8);
  });

  for (const {
    name,
    coerce,
    instance,
    pattern,
    format,
  } of ALL_TEMPORAL_TYPES) {
    test(`${name} converts to a clean string schema`, () => {
      for (const schema of [coerce, instance]) {
        const json = convert(schema);

        expect(json.type).toBe("string");
        expect(json.pattern).toBe(pattern);
        expect(json).not.toHaveProperty("anyOf");
        expect(json).not.toHaveProperty("$ref");
        expect(json).not.toHaveProperty("id");
        expect(typeof json.description).toBe("string");

        if (format === undefined) {
          expect(json).not.toHaveProperty("format");
        } else {
          expect(json.format).toBe(format);
        }
      }
    });

    test(`${name} is still broken without the interceptor`, () => {
      const [, json] = bareConverter.convert(coerce, { strategy: "input" });

      expect(json).toHaveProperty("anyOf");
    });
  }

  for (const { name, coerce, pattern, value } of ALL_TEMPORAL_TYPES) {
    test(`${name} round-trips server output through client-side parse`, () => {
      // What the server puts on the wire.
      const wire = value.toJSON();

      // The advertised contract accepts it.
      expect(new RegExp(pattern, "u").test(wire)).toBe(true);

      // The client revives it, and re-serializing is byte-identical.
      const revived = coerce.parse(wire) as { toJSON: () => string };
      expect(revived.toJSON()).toBe(wire);
    });
  }

  test("a value that is already an instance passes through parse unchanged", () => {
    for (const { coerce, value } of ALL_TEMPORAL_TYPES) {
      const parsed = coerce.parse(value) as { toJSON: () => string };

      expect(parsed.toJSON()).toBe(value.toJSON());
    }
  });

  test("all eight compose into one object schema without collisions", () => {
    // Each validator carries a registry `id`; several in one object is where
    // duplicate-id handling would surface.
    const shape = Object.fromEntries(
      ALL_TEMPORAL_TYPES.map(({ name, coerce }) => [name, coerce]),
    );
    const [, json] = converter.convert(z.object(shape), { strategy: "input" });
    const properties = (json as { properties: Record<string, unknown> })
      .properties;

    for (const { name, pattern } of ALL_TEMPORAL_TYPES) {
      expect(properties[name]).toMatchObject({ type: "string", pattern });
    }
  });

  test("a non-ISO calendar round-trips through the advertised contract", () => {
    // Serialization appends a `[u-ca=…]` annotation under a non-ISO calendar,
    // and PlainYearMonth/PlainMonthDay serialize as a full reference date. The
    // emitted `pattern` has to accept what the server actually sends.
    //
    // The spec defines `toJSON()` as `toString({ calendarName: "auto" })`, but
    // temporal-polyfill 1.0.3 drops the annotation from
    // `PlainDateTime.prototype.toJSON()`, so serialize explicitly to check the
    // contract against the string a compliant runtime sends.
    const serialize = (value: {
      toString: (options: { calendarName: "auto" }) => string;
    }): string => value.toString({ calendarName: "auto" });
    const hebrewDate = zoned.toPlainDate().withCalendar("hebrew");
    const cases: [
      z.ZodType,
      { toString: (options: { calendarName: "auto" }) => string },
    ][] = [
      [zPlainDate, hebrewDate],
      [zPlainDateTime, zoned.toPlainDateTime().withCalendar("hebrew")],
      [zPlainYearMonth, hebrewDate.toPlainYearMonth()],
      [zPlainMonthDay, hebrewDate.toPlainMonthDay()],
      [zZonedDateTime, zoned.withCalendar("hebrew")],
    ];

    for (const [schema, value] of cases) {
      const wire = serialize(value);
      expect(wire).toContain("[u-ca=hebrew]");

      const { pattern } = convert(schema);
      expect(new RegExp(pattern as string, "u").test(wire)).toBe(true);

      const revived = schema.parse(wire) as {
        toString: (options: { calendarName: "auto" }) => string;
        calendarId: string;
      };
      expect(revived.calendarId).toBe("hebrew");
      expect(serialize(revived)).toBe(wire);
    }
  });
});

/**
 * The interceptor keys off `temporalRegistry` — `temporal-zod`'s own schemas —
 * rather than off the shape of a schema's `z.globalRegistry` metadata. The
 * global registry is shared with the entire application, so a shape test would
 * also match a consumer's own annotations and short-circuit their conversion,
 * throwing away everything oRPC derives from the schema's checks.
 */
describe("the interceptor only acts on temporal-zod's own schemas", () => {
  test("the registry holds every exported validator and nothing else", () => {
    for (const { coerce, instance } of ALL_TEMPORAL_TYPES) {
      expect(temporalRegistry.has(coerce)).toBe(true);
      expect(temporalRegistry.has(instance)).toBe(true);
    }

    // The metadata-free `temporal-zod/base` variants are not members.
    expect(temporalRegistry.has(zInstantBase)).toBe(false);
    expect(temporalRegistry.has(z.string())).toBe(false);
  });

  test("registry entries carry no id, so nothing emits a dangling $ref", () => {
    for (const { coerce, instance, pattern, format } of ALL_TEMPORAL_TYPES) {
      for (const schema of [coerce, instance]) {
        const entry = temporalRegistry.get(schema);

        expect(entry).toMatchObject({ type: "string", pattern });
        expect(entry).not.toHaveProperty("id");
        expect(entry?.format).toBe(format);
      }
    }
  });

  test("a consumer's own JSON-Schema-shaped meta is left to oRPC", () => {
    // Shaped exactly like ours — `type: "string"` plus format/pattern — but not
    // ours. Matching on metadata shape would replace this whole conversion and
    // drop the minLength/maxLength oRPC derives from the checks.
    const email = z
      .string()
      .min(5)
      .max(100)
      .meta({ type: "string", format: "email", pattern: "^.+@.+$" });

    const [, json] = converter.convert(email, { strategy: "input" });

    expect(json).toMatchObject({ minLength: 5, maxLength: 100 });
    // Identical to what oRPC produces on its own — the interceptor stood aside.
    expect(json).toEqual(
      bareConverter.convert(email, { strategy: "input" })[1],
    );
  });

  test("a consumer's id-bearing meta still gets oRPC's $ref treatment", () => {
    const userId = z.string().uuid().meta({ id: "UserId", type: "string" });
    const [, json] = converter.convert(z.object({ a: userId, b: userId }), {
      strategy: "input",
    });

    expect(json).toEqual(
      bareConverter.convert(z.object({ a: userId, b: userId }), {
        strategy: "input",
      })[1],
    );
  });

  test("removing a schema from the registry disables the rewrite for it", () => {
    // Proves the registry is the thing being consulted, not the global one:
    // the `.meta()` registration is untouched, yet the rewrite stops.
    const scratch = z.string().meta({ type: "string", format: "date-time" });
    temporalRegistry.add(scratch, { type: "string", description: "scratch" });

    expect(convert(scratch)).toEqual({
      type: "string",
      description: "scratch",
    });

    temporalRegistry.remove(scratch);

    expect(convert(scratch)).toEqual(
      bareConverter.convert(scratch, { strategy: "input" })[1] as Record<
        string,
        unknown
      >,
    );
  });
});
