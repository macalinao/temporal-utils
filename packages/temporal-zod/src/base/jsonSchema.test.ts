import { describe, expect, test } from "bun:test";
import Ajv2020 from "ajv/dist/2020";
import { Temporal } from "temporal-polyfill";
import * as z from "zod";
import { zDuration, zDurationInstance } from "./duration.js";
import { zInstant, zInstantInstance } from "./instant.js";
import { zPlainDate, zPlainDateInstance } from "./plainDate.js";
import {
  PLAIN_DATE_TIME_PATTERN,
  zPlainDateTime,
  zPlainDateTimeInstance,
} from "./plainDateTime.js";
import {
  PLAIN_MONTH_DAY_PATTERN,
  zPlainMonthDay,
  zPlainMonthDayInstance,
} from "./plainMonthDay.js";
import { zPlainTime, zPlainTimeInstance } from "./plainTime.js";
import {
  PLAIN_YEAR_MONTH_PATTERN,
  zPlainYearMonth,
  zPlainYearMonthInstance,
} from "./plainYearMonth.js";
import {
  ZONED_DATE_TIME_PATTERN,
  zZonedDateTime,
  zZonedDateTimeInstance,
} from "./zonedDateTime.js";

/**
 * Test configuration for each Temporal type's JSON Schema.
 */
const TYPES = [
  {
    name: "Instant",
    coerce: zInstant,
    instance: zInstantInstance,
    format: "date-time",
  },
  {
    name: "PlainDate",
    coerce: zPlainDate,
    instance: zPlainDateInstance,
    format: "date",
  },
  {
    name: "PlainTime",
    coerce: zPlainTime,
    instance: zPlainTimeInstance,
    format: "time",
  },
  {
    name: "PlainDateTime",
    coerce: zPlainDateTime,
    instance: zPlainDateTimeInstance,
    pattern: PLAIN_DATE_TIME_PATTERN,
  },
  {
    name: "PlainYearMonth",
    coerce: zPlainYearMonth,
    instance: zPlainYearMonthInstance,
    pattern: PLAIN_YEAR_MONTH_PATTERN,
  },
  {
    name: "PlainMonthDay",
    coerce: zPlainMonthDay,
    instance: zPlainMonthDayInstance,
    pattern: PLAIN_MONTH_DAY_PATTERN,
  },
  {
    name: "ZonedDateTime",
    coerce: zZonedDateTime,
    instance: zZonedDateTimeInstance,
    pattern: ZONED_DATE_TIME_PATTERN,
  },
  {
    name: "Duration",
    coerce: zDuration,
    instance: zDurationInstance,
    format: "duration",
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
      expect((schema as Record<string, unknown>).$defs).toHaveProperty(t.name);
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
    expect(defs).toHaveProperty("Instant");
    expect(defs).toHaveProperty("PlainDate");
    expect(defs).toHaveProperty("Duration");
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment -- Ajv2020 untyped
      const ajv = new Ajv2020({ validateFormats: false });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment -- Ajv2020 untyped
      const validate = ajv.compile(jsonSchema as Record<string, unknown>);

      test("serialized Temporal object validates", () => {
        const serialized: unknown = JSON.parse(JSON.stringify(temporalObject));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Ajv2020 untyped
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Ajv2020 untyped
        expect(validate(bad)).toBe(false);
      });

      test("rejects object with missing fields", () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Ajv2020 untyped
        expect(validate({})).toBe(false);
      });
    });
  }
});

describe("regex patterns validate correctly", () => {
  const PATTERN_TYPES = [
    {
      name: "PlainDateTime",
      pattern: PLAIN_DATE_TIME_PATTERN,
      valid: [
        "2023-01-15T13:45",
        "2023-01-15T13:45:30",
        "2023-01-15T13:45:30.123",
      ],
      invalid: ["2023-01-15T13:45:30Z", "2023-13-15T13:45:30"],
    },
    {
      name: "PlainYearMonth",
      pattern: PLAIN_YEAR_MONTH_PATTERN,
      valid: ["2023-01", "2023-12"],
      invalid: ["2023-00", "2023-13", "2023-01-15"],
    },
    {
      name: "PlainMonthDay",
      pattern: PLAIN_MONTH_DAY_PATTERN,
      valid: ["01-15", "--01-15"],
      invalid: ["13-15", "01-32"],
    },
    {
      name: "ZonedDateTime",
      pattern: ZONED_DATE_TIME_PATTERN,
      valid: [
        "2023-01-15T13:45:30+08:00[Asia/Manila]",
        "2023-01-15T13:45:30Z[UTC]",
        "2023-01-15T13:45:30.123+00:00[Europe/London]",
      ],
      invalid: [
        "2023-01-15T13:45:30+08:00",
        "2023-01-15T13:45:30[Asia/Manila]",
      ],
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
