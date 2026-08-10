import type { ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";
import { describe, expect, test } from "bun:test";
import { Ajv2020 } from "ajv/dist/2020.js";
import * as _addFormats from "ajv-formats";

// CJS/ESM interop: ajv-formats default export type is lost through namespace import
const addFormats = _addFormats.default as unknown as FormatsPlugin;

import { Temporal } from "ponyfill-temporal";
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

/**
 * Test configuration for each Temporal type's JSON Schema.
 */
const TYPES = [
  {
    name: "Temporal.Instant",
    coerce: zInstant,
    instance: zInstantInstance,
    format: "date-time",
    pattern: INSTANT_PATTERN,
  },
  {
    name: "Temporal.PlainDate",
    coerce: zPlainDate,
    instance: zPlainDateInstance,
    format: "date",
    pattern: PLAIN_DATE_PATTERN,
  },
  {
    name: "Temporal.PlainTime",
    coerce: zPlainTime,
    instance: zPlainTimeInstance,
    pattern: PLAIN_TIME_PATTERN,
  },
  {
    name: "Temporal.PlainDateTime",
    coerce: zPlainDateTime,
    instance: zPlainDateTimeInstance,
    pattern: PLAIN_DATE_TIME_PATTERN,
  },
  {
    name: "Temporal.PlainYearMonth",
    coerce: zPlainYearMonth,
    instance: zPlainYearMonthInstance,
    pattern: PLAIN_YEAR_MONTH_PATTERN,
  },
  {
    name: "Temporal.PlainMonthDay",
    coerce: zPlainMonthDay,
    instance: zPlainMonthDayInstance,
    pattern: PLAIN_MONTH_DAY_PATTERN,
  },
  {
    name: "Temporal.ZonedDateTime",
    coerce: zZonedDateTime,
    instance: zZonedDateTimeInstance,
    pattern: ZONED_DATE_TIME_PATTERN,
  },
  {
    name: "Temporal.Duration",
    coerce: zDuration,
    instance: zDurationInstance,
    format: "duration",
    pattern: DURATION_PATTERN,
  },
] as const;

describe("toJSONSchema", () => {
  for (const t of TYPES) {
    describe(t.name, () => {
      const expectedFields: Record<string, unknown> = {
        type: "string",
        id: t.name,
      };
      if ("pattern" in t) {
        expectedFields.pattern = t.pattern;
      }
      if ("format" in t) {
        expectedFields.format = t.format;
      }

      test("coerce schema has correct fields", () => {
        const schema = z.toJSONSchema(t.coerce);
        expect(schema).toMatchObject(expectedFields);
        expect(schema).toHaveProperty("description");
      });

      test("instance schema has correct fields", () => {
        const schema = z.toJSONSchema(t.instance);
        expect(schema).toMatchObject(expectedFields);
        expect(schema).toHaveProperty("description");
      });

      test("works with both io: input and io: output", () => {
        const input = z.toJSONSchema(t.coerce, { io: "input" });
        const output = z.toJSONSchema(t.coerce, { io: "output" });
        expect(input).toMatchObject(expectedFields);
        expect(output).toMatchObject(expectedFields);
      });
    });
  }
});

describe("$defs in composed schemas", () => {
  for (const t of TYPES) {
    test(`${t.name} produces $ref/$defs when used in z.object()`, () => {
      const schema = z.toJSONSchema(z.object({ a: t.coerce, b: t.coerce }));
      expect(schema).toMatchObject({
        type: "object",
        properties: {
          a: { $ref: `#/$defs/${t.name}` },
          b: { $ref: `#/$defs/${t.name}` },
        },
      });
      expect((schema as Record<string, unknown>).$defs).toHaveProperty([
        t.name,
      ]);
    });
  }

  test("mixed types each get their own $def", () => {
    const schema = z.toJSONSchema(
      z.object({
        instant: zInstant,
        date: zPlainDate,
        duration: zDuration,
      }),
    );
    const defs = (schema as Record<string, unknown>).$defs as Record<
      string,
      unknown
    >;
    expect(defs).toHaveProperty(["Temporal.Instant"]);
    expect(defs).toHaveProperty(["Temporal.PlainDate"]);
    expect(defs).toHaveProperty(["Temporal.Duration"]);
  });
});

/**
 * Strips the Zod-specific `id` field from a JSON schema (recursively)
 * so AJV can compile it. AJV treats bare `id` as a legacy draft-04
 * keyword and refuses it in draft-2020-12 mode.
 */
function stripZodId(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(stripZodId);
  }
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "id") {
      continue;
    }
    result[k] = stripZodId(v);
  }
  return result;
}

const IO_MODES = [
  { name: "default", opts: {} },
  { name: "io: input", opts: { io: "input" as const } },
];

describe("JSON.parse(JSON.stringify(...)) round-trip validates against generated schema", () => {
  const zodSchema = z.object({
    instant: zInstant,
    instantInstance: zInstantInstance,
    plainDate: zPlainDate,
    plainDateInstance: zPlainDateInstance,
    plainTime: zPlainTime,
    plainTimeInstance: zPlainTimeInstance,
    plainDateTime: zPlainDateTime,
    plainDateTimeInstance: zPlainDateTimeInstance,
    plainYearMonth: zPlainYearMonth,
    plainYearMonthInstance: zPlainYearMonthInstance,
    plainMonthDay: zPlainMonthDay,
    plainMonthDayInstance: zPlainMonthDayInstance,
    zonedDateTime: zZonedDateTime,
    zonedDateTimeInstance: zZonedDateTimeInstance,
    duration: zDuration,
    durationInstance: zDurationInstance,
  });

  const temporalObject = {
    instant: Temporal.Instant.from("2023-01-15T13:45:30Z"),
    instantInstance: Temporal.Instant.from("2023-06-20T08:00:00+05:30"),
    plainDate: Temporal.PlainDate.from("2023-01-15"),
    plainDateInstance: Temporal.PlainDate.from("2023-12-31"),
    plainTime: Temporal.PlainTime.from("13:45:30"),
    plainTimeInstance: Temporal.PlainTime.from("00:00:00"),
    plainDateTime: Temporal.PlainDateTime.from("2023-01-15T13:45:30"),
    plainDateTimeInstance: Temporal.PlainDateTime.from("2023-06-20T08:00:00"),
    plainYearMonth: Temporal.PlainYearMonth.from("2023-01"),
    plainYearMonthInstance: Temporal.PlainYearMonth.from("2023-12"),
    plainMonthDay: Temporal.PlainMonthDay.from("01-15"),
    plainMonthDayInstance: Temporal.PlainMonthDay.from("12-25"),
    zonedDateTime: Temporal.ZonedDateTime.from(
      "2023-01-15T13:45:30+08:00[Asia/Manila]",
    ),
    zonedDateTimeInstance: Temporal.ZonedDateTime.from(
      "2023-06-20T12:00:00Z[UTC]",
    ),
    duration: Temporal.Duration.from("PT1H30M"),
    durationInstance: Temporal.Duration.from("P1Y2M3D"),
  };

  for (const mode of IO_MODES) {
    describe(`with ${mode.name}`, () => {
      const jsonSchema = stripZodId(z.toJSONSchema(zodSchema, mode.opts));
      const ajv = addFormats(new Ajv2020(), { mode: "fast" });
      const validate: ValidateFunction = ajv.compile(
        jsonSchema as Record<string, unknown>,
      );

      test("serialized Temporal object validates", () => {
        const serialized: unknown = JSON.parse(JSON.stringify(temporalObject));
        expect(validate(serialized)).toBe(true);
      });

      test("serialized non-ISO calendar values validate", () => {
        // toJSON() appends [u-ca=…] here, and PlainYearMonth/PlainMonthDay
        // switch to a full reference date. The generated schema has to accept
        // all of it, or an OpenAPI consumer would reject what the server sends.
        //
        // plainDate stays ISO: it is the one calendar-bearing type that also
        // declares `format: "date"`, which by definition cannot hold an
        // annotation. See the dedicated test below.
        const hebrewDate =
          Temporal.PlainDate.from("2023-01-15").withCalendar("hebrew");
        const serialized: unknown = JSON.parse(
          JSON.stringify({
            ...temporalObject,
            plainDateTime: Temporal.PlainDateTime.from(
              "2023-01-15T13:45:30",
            ).withCalendar("hebrew"),
            plainYearMonth: hebrewDate.toPlainYearMonth(),
            plainMonthDay: hebrewDate.toPlainMonthDay(),
            zonedDateTime: Temporal.ZonedDateTime.from(
              "2023-01-15T13:45:30+08:00[Asia/Manila]",
            ).withCalendar("hebrew"),
          }),
        );
        expect(validate(serialized)).toBe(true);
      });

      test("rejects object with invalid field values", () => {
        const bad = {
          ...(JSON.parse(JSON.stringify(temporalObject)) as Record<
            string,
            unknown
          >),
          plainDateTime: "not-a-date",
        };
        expect(validate(bad)).toBe(false);
      });

      test("rejects object with missing fields", () => {
        expect(validate({})).toBe(false);
      });
    });
  }
});

/**
 * `PLAIN_DATE_PATTERN` accepts the `[u-ca=…]` annotation, but `format: "date"`
 * is RFC 3339 full-date and cannot. PlainDate is the only calendar-bearing type
 * that declares a `format`, so it is the only place the two disagree.
 *
 * The `format` is kept because it is correct and useful for the overwhelmingly
 * common ISO case, and because `format` is an annotation rather than an
 * assertion unless a validator opts in (as ajv-formats does here). Dropping it
 * would degrade every ISO consumer to fix a rare one. Worth revisiting if
 * non-ISO calendars become a first-class use case.
 */
describe("PlainDate format vs. calendar annotation", () => {
  const ajv = addFormats(new Ajv2020(), { mode: "fast" });
  const validate: ValidateFunction = ajv.compile(
    stripZodId(z.toJSONSchema(zPlainDate)) as Record<string, unknown>,
  );
  const hebrew = Temporal.PlainDate.from("2023-01-15")
    .withCalendar("hebrew")
    .toJSON();

  test("the pattern accepts an annotated date", () => {
    expect(new RegExp(PLAIN_DATE_PATTERN).test(hebrew)).toBe(true);
  });

  test('but format: "date" does not', () => {
    expect(validate(hebrew)).toBe(false);
    expect(validate("2023-01-15")).toBe(true);
  });
});

/**
 * The published patterns are a contract: whatever `toJSON()` emits has to match
 * one, and parsing that string back has to reproduce it byte for byte. The cases
 * above check that per type; these check the two axes where the string carries
 * information beyond the date itself — the calendar and the UTC offset.
 */
describe("annotated strings survive the pattern and the round trip", () => {
  const zoned = Temporal.ZonedDateTime.from(
    "2023-01-15T13:45:30+08:00[Asia/Manila]",
  );

  test("every calendar Temporal supports round-trips as a PlainDate", () => {
    for (const calendar of [
      "hebrew",
      "japanese",
      "islamic-umalqura",
      "chinese",
      "indian",
      "persian",
      "buddhist",
      "coptic",
      "ethiopic",
      "roc",
      "gregory",
    ]) {
      const wire = zoned.toPlainDate().withCalendar(calendar).toJSON();

      expect(new RegExp(PLAIN_DATE_PATTERN, "u").test(wire)).toBe(true);
      expect(zPlainDate.parse(wire).calendarId).toBe(calendar);
    }
  });

  test("the bracketed IANA time zone and calendar both survive", () => {
    const revived = zZonedDateTime.parse(zoned.withCalendar("hebrew").toJSON());

    expect(revived.timeZoneId).toBe("Asia/Manila");
    expect(revived.calendarId).toBe("hebrew");
  });

  test("the offset disambiguates a DST fall-back instant", () => {
    // 01:30 happens twice on this date in New York; only the offset in the
    // string says which one, so dropping it would silently shift the instant.
    const ambiguous = Temporal.ZonedDateTime.from(
      "2023-11-05T01:30:00-05:00[America/New_York]",
    );
    const revived = zZonedDateTime.parse(ambiguous.toJSON());

    expect(revived.epochNanoseconds).toBe(ambiguous.epochNanoseconds);
  });

  test("an extended (BCE) year parses back to a negative year", () => {
    const wire = Temporal.PlainDate.from("-000753-04-21").toJSON();

    expect(new RegExp(PLAIN_DATE_PATTERN, "u").test(wire)).toBe(true);
    expect(zPlainDate.parse(wire).year).toBe(-753);
  });
});

describe("full JSON Schema snapshot for all types", () => {
  const allTypes = z.object({
    instant: zInstant,
    plainDate: zPlainDate,
    plainTime: zPlainTime,
    plainDateTime: zPlainDateTime,
    plainYearMonth: zPlainYearMonth,
    plainMonthDay: zPlainMonthDay,
    zonedDateTime: zZonedDateTime,
    duration: zDuration,
  });

  const schema = z.toJSONSchema(allTypes);

  test("produces correct top-level structure", () => {
    expect(schema).toMatchObject({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      required: [
        "instant",
        "plainDate",
        "plainTime",
        "plainDateTime",
        "plainYearMonth",
        "plainMonthDay",
        "zonedDateTime",
        "duration",
      ],
      additionalProperties: false,
    });
  });

  test("all properties use $ref to $defs", () => {
    const props = (schema as Record<string, unknown>).properties as Record<
      string,
      { $ref: string }
    >;
    expect(props.instant?.$ref).toBe("#/$defs/Temporal.Instant");
    expect(props.plainDate?.$ref).toBe("#/$defs/Temporal.PlainDate");
    expect(props.plainTime?.$ref).toBe("#/$defs/Temporal.PlainTime");
    expect(props.plainDateTime?.$ref).toBe("#/$defs/Temporal.PlainDateTime");
    expect(props.plainYearMonth?.$ref).toBe("#/$defs/Temporal.PlainYearMonth");
    expect(props.plainMonthDay?.$ref).toBe("#/$defs/Temporal.PlainMonthDay");
    expect(props.zonedDateTime?.$ref).toBe("#/$defs/Temporal.ZonedDateTime");
    expect(props.duration?.$ref).toBe("#/$defs/Temporal.Duration");
  });

  test("$defs contain complete metadata for every Temporal type", () => {
    const defs = (schema as Record<string, unknown>).$defs as Record<
      string,
      Record<string, unknown>
    >;

    expect(defs["Temporal.Instant"]).toEqual({
      type: "string",
      id: "Temporal.Instant",
      description:
        "An ISO 8601 instant string with a required UTC offset (e.g. 2023-01-15T13:45:30Z)",
      format: "date-time",
      pattern: INSTANT_PATTERN,
    });

    expect(defs["Temporal.PlainDate"]).toEqual({
      type: "string",
      id: "Temporal.PlainDate",
      description: "An ISO 8601 date string without time (e.g. 2023-01-15)",
      format: "date",
      pattern: PLAIN_DATE_PATTERN,
    });

    expect(defs["Temporal.PlainTime"]).toEqual({
      type: "string",
      id: "Temporal.PlainTime",
      description:
        "An ISO 8601 time string without date or timezone (e.g. 13:45:30)",
      pattern: PLAIN_TIME_PATTERN,
    });

    expect(defs["Temporal.PlainDateTime"]).toEqual({
      type: "string",
      id: "Temporal.PlainDateTime",
      description:
        "An ISO 8601 date-time string without timezone (e.g. 2023-01-15T13:45:30)",
      pattern: PLAIN_DATE_TIME_PATTERN,
    });

    expect(defs["Temporal.PlainYearMonth"]).toEqual({
      type: "string",
      id: "Temporal.PlainYearMonth",
      description: "An ISO 8601 year-month string (e.g. 2023-01)",
      pattern: PLAIN_YEAR_MONTH_PATTERN,
    });

    expect(defs["Temporal.PlainMonthDay"]).toEqual({
      type: "string",
      id: "Temporal.PlainMonthDay",
      description: "An ISO 8601 month-day string (e.g. --01-15 or 01-15)",
      pattern: PLAIN_MONTH_DAY_PATTERN,
    });

    expect(defs["Temporal.ZonedDateTime"]).toEqual({
      type: "string",
      id: "Temporal.ZonedDateTime",
      description:
        "An ISO 8601 date-time string with timezone offset and IANA annotation (e.g. 2023-01-15T13:45:30+08:00[Asia/Manila])",
      pattern: ZONED_DATE_TIME_PATTERN,
    });

    expect(defs["Temporal.Duration"]).toEqual({
      type: "string",
      id: "Temporal.Duration",
      description: "An ISO 8601 duration string (e.g. PT1H30M, P1Y2M3D)",
      format: "duration",
      pattern: DURATION_PATTERN,
    });
  });

  test("types without format omit it (PlainTime, PlainDateTime, PlainYearMonth, PlainMonthDay, ZonedDateTime)", () => {
    const defs = (schema as Record<string, unknown>).$defs as Record<
      string,
      Record<string, unknown>
    >;
    for (const name of [
      "Temporal.PlainTime",
      "Temporal.PlainDateTime",
      "Temporal.PlainYearMonth",
      "Temporal.PlainMonthDay",
      "Temporal.ZonedDateTime",
    ]) {
      expect(defs[name]).not.toHaveProperty("format");
    }
  });

  test("types with format include it (Instant=date-time, PlainDate=date, Duration=duration)", () => {
    const defs = (schema as Record<string, unknown>).$defs as Record<
      string,
      Record<string, unknown>
    >;
    expect(defs["Temporal.Instant"]?.format).toBe("date-time");
    expect(defs["Temporal.PlainDate"]?.format).toBe("date");
    expect(defs["Temporal.Duration"]?.format).toBe("duration");
  });
});

describe("regex patterns validate correctly", () => {
  const PATTERN_TYPES = [
    {
      name: "Instant",
      pattern: INSTANT_PATTERN,
      valid: [
        "2023-01-15T13:45:30Z",
        "2023-01-15T13:45:30+05:30",
        "2023-01-15T13:45:30.123456789Z",
        "2023-01-15T13:45:30Z[UTC]",
      ],
      invalid: ["2023-01-15T13:45:30", "2023-01-15", "2023-13-15T13:45:30Z"],
    },
    {
      name: "PlainDate",
      pattern: PLAIN_DATE_PATTERN,
      valid: [
        "2023-01-15",
        "2023-12-31",
        // Non-ISO calendar annotation, as emitted by toJSON().
        "2023-01-15[u-ca=hebrew]",
        "2023-01-15[u-ca=islamic-umalqura]",
        // Signed six-digit year, for years outside 0000-9999.
        "-000753-04-21",
        "+010000-01-01",
      ],
      invalid: [
        "2023-00-15",
        "2023-13-15",
        "2023-01-32",
        "2023-01-15T13:45",
        "2023-01-15[u-ca=]",
        "2023-01-15[nonsense]",
      ],
    },
    {
      name: "PlainTime",
      pattern: PLAIN_TIME_PATTERN,
      valid: ["13:45", "13:45:30", "13:45:30.123456789", "00:00", "23:59:59"],
      invalid: ["24:00", "13:45:30Z", "13:60", "13:45:30+00:00"],
    },
    {
      name: "PlainDateTime",
      pattern: PLAIN_DATE_TIME_PATTERN,
      valid: [
        "2023-01-15T13:45",
        "2023-01-15T13:45:30",
        "2023-01-15T13:45:30.123",
        "2023-01-15T13:45:30[u-ca=hebrew]",
      ],
      invalid: ["2023-01-15T13:45:30Z", "2023-13-15T13:45:30"],
    },
    {
      name: "PlainYearMonth",
      pattern: PLAIN_YEAR_MONTH_PATTERN,
      // Under a non-ISO calendar toJSON() emits a full reference date, so that
      // form is valid — but only with the annotation, so a bare date is not.
      valid: ["2023-01", "2023-12", "2022-12-25[u-ca=hebrew]"],
      invalid: ["2023-00", "2023-13", "2023-01-15", "2023-01-15[u-ca=]"],
    },
    {
      name: "PlainMonthDay",
      pattern: PLAIN_MONTH_DAY_PATTERN,
      valid: ["01-15", "--01-15", "1972-12-27[u-ca=hebrew]"],
      invalid: ["13-15", "01-32", "2023-01-15", "1972-12-27"],
    },
    {
      name: "ZonedDateTime",
      pattern: ZONED_DATE_TIME_PATTERN,
      valid: [
        "2023-01-15T13:45:30+08:00[Asia/Manila]",
        "2023-01-15T13:45:30Z[UTC]",
        "2023-01-15T13:45:30.123+00:00[Europe/London]",
        "2023-01-15T13:45:30+08:00[Asia/Manila][u-ca=hebrew]",
        "2023-01-15T13:45:30-03:00[America/Argentina/Buenos_Aires]",
        "2023-01-15T13:45:30+08:00[+08:00]",
      ],
      invalid: [
        "2023-01-15T13:45:30+08:00",
        "2023-01-15T13:45:30[Asia/Manila]",
        // The time zone group must not swallow a second bracket group.
        "2023-01-15T13:45:30+08:00[not a time zone!][]",
        "2023-01-15T13:45:30+08:00[Asia/Manila][u-ca=]",
      ],
    },
    {
      name: "Duration",
      pattern: DURATION_PATTERN,
      valid: ["PT1H30M", "P1Y2M3D", "P1Y2M3DT4H5M6.5S", "-PT1H"],
      invalid: ["1H30M", "hello"],
    },
  ] as const;

  for (const t of PATTERN_TYPES) {
    describe(t.name, () => {
      const re = new RegExp(t.pattern);

      for (const v of t.valid) {
        test(`accepts "${v}"`, () => {
          expect(re.test(v)).toBe(true);
        });
      }

      for (const v of t.invalid) {
        test(`rejects "${v}"`, () => {
          expect(re.test(v)).toBe(false);
        });
      }
    });
  }
});
