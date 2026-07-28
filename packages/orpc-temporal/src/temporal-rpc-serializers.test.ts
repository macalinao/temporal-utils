import { describe, expect, test } from "bun:test";
import {
  StandardRPCJsonSerializer,
  StandardRPCSerializer,
} from "@orpc/client/standard";
import { Temporal } from "temporal-polyfill";
import {
  createTemporalRPCSerializers,
  DEFAULT_TEMPORAL_RPC_SERIALIZER_BASE_TYPE,
  TEMPORAL_RPC_SERIALIZER_TYPE_OFFSETS,
  temporalRPCSerializers,
} from "./temporal-rpc-serializers.js";

const serializer = new StandardRPCSerializer(
  new StandardRPCJsonSerializer({
    customJsonSerializers: temporalRPCSerializers,
  }),
);

/**
 * Sends a value through the full oRPC wire cycle: serialize, encode as JSON
 * text, decode, deserialize. The `JSON.parse(JSON.stringify(...))` step is what
 * makes this a real round trip rather than an in-memory pass-through.
 */
const roundTrip = <T>(value: T): T => {
  const wire = JSON.parse(
    JSON.stringify(serializer.serialize(value)),
  ) as unknown;
  return serializer.deserialize(wire) as T;
};

describe("temporalRPCSerializers", () => {
  describe("round-trips every Temporal type", () => {
    const zoned = Temporal.ZonedDateTime.from(
      "2022-01-28T19:53+01:00[Europe/Berlin]",
    );

    const cases = {
      instant: zoned.toInstant(),
      zonedDateTime: zoned,
      plainDate: zoned.toPlainDate(),
      plainTime: zoned.toPlainTime(),
      plainDateTime: zoned.toPlainDateTime(),
      plainYearMonth: zoned.toPlainDate().toPlainYearMonth(),
      plainMonthDay: zoned.toPlainDate().toPlainMonthDay(),
      duration: Temporal.Duration.from("P1Y2M3DT4H5M6.789S"),
    };

    for (const [name, value] of Object.entries(cases)) {
      test(name, () => {
        const result = roundTrip(value);

        expect(result).toBeInstanceOf(
          (value as object).constructor as new () => unknown,
        );
        expect(result.toString()).toEqual(value.toString());
      });
    }

    test("all eight types survive a single nested payload", () => {
      const result = roundTrip({ nested: { deep: cases }, list: [cases] });

      expect(result.nested.deep.instant).toBeInstanceOf(Temporal.Instant);
      expect(result.list[0]?.plainDate).toBeInstanceOf(Temporal.PlainDate);
      expect(result.nested.deep.zonedDateTime.equals(zoned)).toBe(true);
      expect(result.list[0]?.duration.toString()).toEqual(
        cases.duration.toString(),
      );
    });
  });

  describe("preserves time zone and calendar", () => {
    test("ZonedDateTime keeps its time zone rather than collapsing to an offset", () => {
      const value = Temporal.ZonedDateTime.from(
        "2022-01-28T19:53+01:00[Europe/Berlin]",
      );
      const result = roundTrip(value);

      expect(result.timeZoneId).toEqual("Europe/Berlin");
      expect(result.equals(value)).toBe(true);
    });

    test("ZonedDateTime keeps a non-ISO calendar", () => {
      const value = Temporal.ZonedDateTime.from(
        "2022-01-28T19:53+01:00[Europe/Berlin][u-ca=hebrew]",
      );
      const result = roundTrip(value);

      expect(result.calendarId).toEqual("hebrew");
      expect(result.timeZoneId).toEqual("Europe/Berlin");
      expect(result.equals(value)).toBe(true);
    });

    test("ZonedDateTime survives a DST fall-back instant", () => {
      // 2:30am occurs twice on this date in New York; the offset in the string
      // is what disambiguates it.
      const value = Temporal.ZonedDateTime.from(
        "2023-11-05T01:30:00-05:00[America/New_York]",
      );
      const result = roundTrip(value);

      expect(result.offset).toEqual("-05:00");
      expect(result.epochNanoseconds).toEqual(value.epochNanoseconds);
    });

    test.each([
      ["hebrew"],
      ["japanese"],
      ["islamic-umalqura"],
      ["chinese"],
    ] as const)("PlainDate keeps the %s calendar", (calendar) => {
      const value =
        Temporal.PlainDate.from("2024-02-29").withCalendar(calendar);
      const result = roundTrip(value);

      expect(result.calendarId).toEqual(calendar);
      expect(result.equals(value)).toBe(true);
    });

    test("PlainDateTime keeps a non-ISO calendar", () => {
      const value = Temporal.PlainDateTime.from(
        "2024-02-29T01:02:03",
      ).withCalendar("hebrew");
      const result = roundTrip(value);

      expect(result.calendarId).toEqual("hebrew");
      expect(result.equals(value)).toBe(true);
    });

    test("PlainYearMonth keeps a non-ISO calendar", () => {
      const value = Temporal.PlainDate.from("2024-02-29")
        .withCalendar("hebrew")
        .toPlainYearMonth();
      const result = roundTrip(value);

      expect(result.calendarId).toEqual("hebrew");
      expect(result.equals(value)).toBe(true);
    });

    test("PlainMonthDay keeps a non-ISO calendar", () => {
      const value = Temporal.PlainDate.from("2024-02-29")
        .withCalendar("hebrew")
        .toPlainMonthDay();
      const result = roundTrip(value);

      expect(result.calendarId).toEqual("hebrew");
      expect(result.equals(value)).toBe(true);
    });
  });

  describe("preserves sub-second precision", () => {
    test("Instant keeps nanoseconds", () => {
      const value = Temporal.Instant.from("2022-01-28T18:53:00.123456789Z");
      const result = roundTrip(value);

      expect(result.epochNanoseconds).toEqual(value.epochNanoseconds);
      expect(result.equals(value)).toBe(true);
    });

    test("PlainTime keeps nanoseconds", () => {
      const value = Temporal.PlainTime.from("01:02:03.123456789");
      const result = roundTrip(value);

      expect(result.millisecond).toEqual(123);
      expect(result.microsecond).toEqual(456);
      expect(result.nanosecond).toEqual(789);
      expect(result.equals(value)).toBe(true);
    });

    test("PlainDateTime keeps nanoseconds", () => {
      const value = Temporal.PlainDateTime.from(
        "2024-02-29T01:02:03.123456789",
      );
      const result = roundTrip(value);

      expect(result.nanosecond).toEqual(789);
      expect(result.equals(value)).toBe(true);
    });

    test("Duration keeps a single nanosecond", () => {
      const value = Temporal.Duration.from({ nanoseconds: 1 });
      const result = roundTrip(value);

      expect(result.nanoseconds).toEqual(1);
      expect(result.total("nanoseconds")).toEqual(1);
    });
  });

  describe("Duration edge cases", () => {
    test("negative duration keeps its sign", () => {
      const value = Temporal.Duration.from("-P1Y2M3DT4H5M6.789S");
      const result = roundTrip(value);

      expect(result.sign).toEqual(-1);
      expect(result.toString()).toEqual(value.toString());
      expect(Temporal.Duration.compare(result, value)).toEqual(0);
    });

    test("negative duration keeps each unit negative", () => {
      const value = Temporal.Duration.from({ hours: -4, minutes: -5 });
      const result = roundTrip(value);

      expect(result.hours).toEqual(-4);
      expect(result.minutes).toEqual(-5);
    });

    test("zero duration round-trips", () => {
      const value = Temporal.Duration.from({ seconds: 0 });
      const result = roundTrip(value);

      expect(result.sign).toEqual(0);
      expect(result.toString()).toEqual("PT0S");
    });

    test("unbalanced units are not silently normalized", () => {
      // P1M and P30D are different durations; the wire format must not
      // collapse one into the other.
      const value = Temporal.Duration.from({ months: 1 });
      const result = roundTrip(value);

      expect(result.months).toEqual(1);
      expect(result.days).toEqual(0);
    });

    test("weeks are preserved separately from days", () => {
      const value = Temporal.Duration.from({ weeks: 2 });
      const result = roundTrip(value);

      expect(result.weeks).toEqual(2);
      expect(result.days).toEqual(0);
    });

    test("large duration round-trips", () => {
      const value = Temporal.Duration.from({ hours: 1_000_000 });
      const result = roundTrip(value);

      expect(result.hours).toEqual(1_000_000);
    });
  });

  describe("edge case dates", () => {
    test("leap day round-trips", () => {
      const value = Temporal.PlainDate.from("2024-02-29");
      expect(roundTrip(value).equals(value)).toBe(true);
    });

    test("negative (BCE) year round-trips", () => {
      const value = Temporal.PlainDate.from("-000753-04-21");
      const result = roundTrip(value);

      expect(result.year).toEqual(-753);
      expect(result.equals(value)).toBe(true);
    });

    test("midnight PlainTime round-trips", () => {
      const value = Temporal.PlainTime.from("00:00:00");
      expect(roundTrip(value).equals(value)).toBe(true);
    });

    test("Instant before the epoch round-trips", () => {
      const value = Temporal.Instant.from("1900-01-01T00:00:00Z");
      expect(roundTrip(value).equals(value)).toBe(true);
    });
  });

  describe("coexists with oRPC built-in types", () => {
    test("built-ins still work alongside Temporal values", () => {
      const value = {
        plainDate: Temporal.PlainDate.from("2024-02-29"),
        date: new Date("2024-02-29T00:00:00.000Z"),
        big: 9_007_199_254_740_993n,
        set: new Set([1, 2]),
        map: new Map([["a", 1]]),
        url: new URL("https://example.com/"),
        regexp: /abc/giu,
        undef: undefined,
        nan: Number.NaN,
      };
      const result = roundTrip(value);

      expect(result.plainDate).toBeInstanceOf(Temporal.PlainDate);
      expect(result.date).toBeInstanceOf(Date);
      expect(result.date.getTime()).toEqual(value.date.getTime());
      expect(result.big).toEqual(value.big);
      expect(result.set).toEqual(value.set);
      expect(result.map).toEqual(value.map);
      expect(result.url.toString()).toEqual(value.url.toString());
      expect(result.regexp.source).toEqual(value.regexp.source);
      expect(result.undef).toBeUndefined();
      expect(result.nan).toBeNaN();
    });

    test("a Date is not captured by the Temporal serializers", () => {
      const result = roundTrip({ date: new Date(0) });

      expect(result.date).toBeInstanceOf(Date);
    });
  });

  describe("type IDs", () => {
    test("are unique", () => {
      const types = temporalRPCSerializers.map((s) => s.type);

      expect(new Set(types).size).toEqual(types.length);
    });

    test("cover all eight Temporal types", () => {
      expect(temporalRPCSerializers).toHaveLength(8);
      expect(Object.keys(TEMPORAL_RPC_SERIALIZER_TYPE_OFFSETS)).toHaveLength(8);
    });

    test("do not collide with oRPC's reserved built-in range of 0-7", () => {
      for (const { type } of temporalRPCSerializers) {
        expect(type).toBeGreaterThan(7);
      }
    });

    test("are stable, since they are part of the wire format", () => {
      const base = DEFAULT_TEMPORAL_RPC_SERIALIZER_BASE_TYPE;

      expect(base).toEqual(1000);
      expect(temporalRPCSerializers.map((s) => s.type)).toEqual([
        base,
        base + 1,
        base + 2,
        base + 3,
        base + 4,
        base + 5,
        base + 6,
        base + 7,
      ]);
    });

    test("oRPC accepts the serializers without complaining about duplicates", () => {
      expect(
        () =>
          new StandardRPCJsonSerializer({
            customJsonSerializers: temporalRPCSerializers,
          }),
      ).not.toThrow();
    });
  });

  describe("createTemporalRPCSerializers", () => {
    test("defaults to the standard base type", () => {
      expect(createTemporalRPCSerializers().map((s) => s.type)).toEqual(
        temporalRPCSerializers.map((s) => s.type),
      );
    });

    test("shifts every type ID by a custom base", () => {
      const shifted = createTemporalRPCSerializers({ baseType: 5000 });

      expect(shifted.map((s) => s.type)).toEqual([
        5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007,
      ]);
    });

    test("a custom base still round-trips when both ends agree", () => {
      const custom = new StandardRPCSerializer(
        new StandardRPCJsonSerializer({
          customJsonSerializers: createTemporalRPCSerializers({
            baseType: 5000,
          }),
        }),
      );
      const value = Temporal.PlainDate.from("2024-02-29");
      const wire = JSON.parse(
        JSON.stringify(custom.serialize(value)),
      ) as unknown;
      const result = custom.deserialize(wire);

      expect(result).toBeInstanceOf(Temporal.PlainDate);
      expect((result as Temporal.PlainDate).equals(value)).toBe(true);
    });
  });

  describe("without the serializers", () => {
    test("Temporal values silently arrive as strings", () => {
      // This is the gap the package closes: oRPC has no Temporal support of its
      // own, so `toJSON()` runs during JSON encoding and nothing rebuilds the
      // instance. No error is thrown — the value just has the wrong type.
      const bare = new StandardRPCSerializer(new StandardRPCJsonSerializer());
      const value = { plainDate: Temporal.PlainDate.from("2024-02-29") };
      const wire = JSON.parse(JSON.stringify(bare.serialize(value))) as unknown;
      const result = bare.deserialize(wire) as { plainDate: unknown };

      expect(typeof result.plainDate).toEqual("string");
      expect(result.plainDate).not.toBeInstanceOf(Temporal.PlainDate);
    });
  });
});
