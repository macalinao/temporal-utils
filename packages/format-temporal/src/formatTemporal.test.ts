import { Intl, Temporal } from "temporal-polyfill";
import { describe, expect, it } from "vitest";

import { formatTemporal } from "./formatTemporal.js";

describe("formatTemporal", () => {
  it("should format Temporal.PlainYearMonth correctly", () => {
    const plainYearMonth = Temporal.PlainYearMonth.from("2023-05");
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
    });
    const result = formatTemporal(plainYearMonth, formatter);
    expect(result).toBe("May 2023");
  });

  it("should format Temporal.PlainDateTime correctly", () => {
    const plainDateTime = Temporal.PlainDateTime.from("2023-05-15T13:45:30");
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    const result = formatTemporal(plainDateTime, formatter);
    expect(result).toBe("May 15, 2023 at 1:45:30 PM");
  });

  it("should format Temporal.PlainDate correctly", () => {
    const plainDate = Temporal.PlainDate.from("2023-05-15");
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const result = formatTemporal(plainDate, formatter);
    expect(result).toBe("May 15, 2023");
  });

  it("should format Temporal.PlainTime correctly", () => {
    const plainTime = Temporal.PlainTime.from("13:45:30");
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    const result = formatTemporal(plainTime, formatter);
    expect(result).toBe("1:45:30 PM");
  });

  it("should format Temporal.ZonedDateTime correctly", () => {
    const zonedDateTime = Temporal.ZonedDateTime.from(
      "2023-05-15T13:45:30+08:00[Asia/Manila]",
    );
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "longGeneric",
    });
    const result = formatTemporal(zonedDateTime, formatter);
    expect(result).toBe("May 15, 2023 at 1:45:30 PM Philippine Standard Time");
  });
});
