import type { ZodToJsonSchemaConverterOptions } from "@orpc/zod/zod4";
import { describe, expect, test } from "bun:test";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Temporal } from "temporal-polyfill";
import * as z from "zod";
import {
  DURATION_PATTERN,
  INSTANT_PATTERN,
  PLAIN_DATE_PATTERN,
  PLAIN_DATE_TIME_PATTERN,
  PLAIN_MONTH_DAY_PATTERN,
  PLAIN_TIME_PATTERN,
  PLAIN_YEAR_MONTH_PATTERN,
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
} from "./json-schemas.js";
import { temporalJsonSchemaInterceptor } from "./orpc.js";

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
  /**
   * `orpc.ts` types the interceptor structurally so `temporal-zod` imports
   * nothing from `@orpc/*` — even an `import type` would have to resolve in the
   * shipped `.d.ts`, breaking consumers without `@orpc/zod` who don't set
   * `skipLibCheck`. This assignment is what keeps the structural type honest:
   * it fails to compile if oRPC's real interceptor signature ever drifts.
   */
  test("structural type is assignable to oRPC's interceptor signature", () => {
    const asOrpcInterceptor: NonNullable<
      ZodToJsonSchemaConverterOptions["interceptors"]
    >[number] = temporalJsonSchemaInterceptor;
    expect(asOrpcInterceptor).toBe(temporalJsonSchemaInterceptor);
  });

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
});

/**
 * The interceptor is metadata-driven rather than per-type, so it should cover
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
});

describe("ZonedDateTime string annotations", () => {
  test("the bracketed IANA time zone survives the round trip", () => {
    const wire = zoned.toJSON();

    expect(wire).toBe("2023-01-15T13:45:30+08:00[Asia/Manila]");
    expect(new RegExp(ZONED_DATE_TIME_PATTERN, "u").test(wire)).toBe(true);

    const revived = zZonedDateTime.parse(wire);
    expect(revived.timeZoneId).toBe("Asia/Manila");
    expect(revived.equals(zoned)).toBe(true);
  });

  test("a non-ISO calendar annotation survives the round trip", () => {
    const wire = zoned.withCalendar("hebrew").toJSON();

    expect(wire).toBe("2023-01-15T13:45:30+08:00[Asia/Manila][u-ca=hebrew]");

    const revived = zZonedDateTime.parse(wire);
    expect(revived.calendarId).toBe("hebrew");
    expect(revived.timeZoneId).toBe("Asia/Manila");
  });

  test("the offset disambiguates a DST fall-back instant", () => {
    const ambiguous = Temporal.ZonedDateTime.from(
      "2023-11-05T01:30:00-05:00[America/New_York]",
    );
    const revived = zZonedDateTime.parse(ambiguous.toJSON());

    expect(revived.epochNanoseconds).toBe(ambiguous.epochNanoseconds);
  });
});

/**
 * Characterization tests, not endorsements.
 *
 * The validators parse via `Temporal.X.from()`, which accepts the `[u-ca=…]`
 * annotation that `toJSON()` emits for a non-ISO calendar. The exported
 * patterns do not, so the JSON Schema the interceptor publishes is narrower
 * than what the server emits and the client accepts. Anything enforcing the
 * advertised contract — generated clients, an API gateway, ajv over the
 * OpenAPI document — would reject values that work end to end.
 *
 * These patterns predate oRPC support and are unchanged by it; the mismatch is
 * recorded here because this is where the patterns become a published contract.
 * Should the patterns be widened, these expectations flip to `true` and this
 * block should be deleted.
 */
describe("known limitation: patterns reject non-ISO calendar annotations", () => {
  // PlainYearMonth and PlainMonthDay have no `withCalendar`, so each value is
  // derived from a PlainDate that already carries the calendar.
  const hebrewDate = zoned.toPlainDate().withCalendar("hebrew");
  const withHebrew: [string, z.ZodType, string, { toJSON: () => string }][] = [
    ["PlainDate", zPlainDate, PLAIN_DATE_PATTERN, hebrewDate],
    [
      "PlainDateTime",
      zPlainDateTime,
      PLAIN_DATE_TIME_PATTERN,
      zoned.toPlainDateTime().withCalendar("hebrew"),
    ],
    [
      "PlainYearMonth",
      zPlainYearMonth,
      PLAIN_YEAR_MONTH_PATTERN,
      hebrewDate.toPlainYearMonth(),
    ],
    [
      "PlainMonthDay",
      zPlainMonthDay,
      PLAIN_MONTH_DAY_PATTERN,
      hebrewDate.toPlainMonthDay(),
    ],
  ];

  for (const [name, schema, pattern, value] of withHebrew) {
    test(`${name} parses a hebrew-calendar string the pattern rejects`, () => {
      const wire = value.toJSON();
      expect(wire).toContain("[u-ca=hebrew]");

      // Parsing works end to end...
      const revived = schema.parse(wire) as {
        toJSON: () => string;
        calendarId: string;
      };
      expect(revived.calendarId).toBe("hebrew");
      expect(revived.toJSON()).toBe(wire);

      // ...but the advertised pattern would reject the very same string.
      expect(new RegExp(pattern, "u").test(wire)).toBe(false);
    });
  }

  test("PlainDate rejects an extended (BCE) year it can still parse", () => {
    const wire = Temporal.PlainDate.from("-000753-04-21").toJSON();

    expect(zPlainDate.parse(wire).year).toBe(-753);
    expect(new RegExp(PLAIN_DATE_PATTERN, "u").test(wire)).toBe(false);
  });

  test("ZonedDateTime tolerates its calendar suffix only incidentally", () => {
    // The pattern ends in `\[.+\]`, and `.+` greedily spans the second bracket
    // group — so it matches, but only because the check is that loose. The
    // same pattern accepts an obviously malformed annotation.
    const wire = zoned.withCalendar("hebrew").toJSON();

    expect(new RegExp(ZONED_DATE_TIME_PATTERN, "u").test(wire)).toBe(true);
    expect(
      new RegExp(ZONED_DATE_TIME_PATTERN, "u").test(
        "2023-01-15T13:45:30+08:00[not a time zone!][]",
      ),
    ).toBe(true);
  });
});
