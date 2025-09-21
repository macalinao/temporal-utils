import { Temporal } from "temporal-polyfill";
import { describe, expect, it } from "vitest";
import * as z from "zod";

import { zDuration } from "./duration.js";
import { zInstant } from "./instant.js";
import { zPlainDate, zPlainDateInstance } from "./plainDate.js";
import { zPlainDateTime } from "./plainDateTime.js";
import { zPlainMonthDay, zPlainMonthDayInstance } from "./plainMonthDay.js";
import { zPlainYearMonth, zPlainYearMonthInstance } from "./plainYearMonth.js";
import { zZonedDateTime } from "./zonedDateTime.js";

describe("Temporal Zod Schemas", () => {
  it("should validate a complex object of strings", () => {
    const schema = z.object({
      zonedDateTime: zZonedDateTime,
      instant: zInstant,
      plainDate: zPlainDate,
      plainDateInstance: zPlainDateInstance,
      plainDateTime: zPlainDateTime,
      duration: zDuration,
      plainYearMonth: zPlainYearMonth,
      plainYearMonthInstance: zPlainYearMonthInstance,
      plainMonthDay: zPlainMonthDay,
      plainMonthDayInstance: zPlainMonthDayInstance,
    });
    type InputType = z.input<typeof schema>;

    const input = {
      zonedDateTime: "2023-05-15T13:45:30+08:00[Asia/Manila]",
      instant: "2023-01-01T00:00:00Z",
      plainDate: "2023-01-01",
      plainDateInstance: Temporal.PlainDate.from("2023-01-01"),
      plainDateTime: "2023-01-01T00:00:00",
      duration: "PT1H30M",
      plainYearMonth: "2023-01",
      plainYearMonthInstance: Temporal.PlainYearMonth.from("2023-01"),
      plainMonthDay: "01-01",
      plainMonthDayInstance: Temporal.PlainMonthDay.from("01-01"),
    } satisfies InputType;

    const result = schema.parse(input);
    expect(result.zonedDateTime).toEqual(
      Temporal.ZonedDateTime.from(input.zonedDateTime),
    );
    expect(result.instant).toEqual(Temporal.Instant.from(input.instant));
    expect(result.plainDate).toEqual(Temporal.PlainDate.from(input.plainDate));
    expect(result.plainDateInstance).toEqual(input.plainDateInstance);
    expect(result.plainDateTime).toEqual(
      Temporal.PlainDateTime.from(input.plainDateTime),
    );
    expect(result.duration).toEqual(Temporal.Duration.from(input.duration));
    expect(result.plainYearMonth).toEqual(
      Temporal.PlainYearMonth.from(input.plainYearMonth),
    );
    expect(result.plainYearMonthInstance).toEqual(input.plainYearMonthInstance);
    expect(result.plainMonthDay).toEqual(
      Temporal.PlainMonthDay.from(input.plainMonthDay),
    );
    expect(result.plainMonthDayInstance).toEqual(input.plainMonthDayInstance);
  });

  it("should validate Temporal.Instant", () => {
    const validInstant = Temporal.Instant.from("2023-01-01T00:00:00Z");
    const result = zInstant.safeParse(validInstant);
    expect(result.success).toBe(true);
  });

  it("should validate Temporal.PlainDate", () => {
    const validPlainDate = Temporal.PlainDate.from("2023-01-01");
    const result = zPlainDate.safeParse(validPlainDate);
    expect(result.success).toBe(true);
  });

  it("should validate Temporal.PlainDate instance", () => {
    const validPlainDateInstance = Temporal.PlainDate.from("2023-01-01");
    const result = zPlainDateInstance.safeParse(validPlainDateInstance);
    expect(result.success).toBe(true);
  });

  it("should validate Temporal.Duration", () => {
    const validDuration = Temporal.Duration.from({ hours: 1, minutes: 30 });
    const result = zDuration.safeParse(validDuration);
    expect(result.success).toBe(true);
  });

  it("should invalidate incorrect Temporal.Instant", () => {
    const invalidInstant = "invalid-instant";
    const result = zInstant.safeParse(invalidInstant);
    expect(result.success).toBe(false);
  });

  it("should invalidate incorrect Temporal.PlainDate", () => {
    const invalidPlainDate = "invalid-date";
    const result = zPlainDate.safeParse(invalidPlainDate);
    expect(result.success).toBe(false);
  });

  it("should invalidate incorrect Temporal.PlainDate instance", () => {
    const invalidPlainDateInstance = "invalid-date-instance";
    const result = zPlainDateInstance.safeParse(invalidPlainDateInstance);
    expect(result.success).toBe(false);
  });

  it("should invalidate incorrect Temporal.Duration", () => {
    const invalidDuration = "invalid-duration";
    const result = zDuration.safeParse(invalidDuration);
    expect(result.success).toBe(false);
  });
});
