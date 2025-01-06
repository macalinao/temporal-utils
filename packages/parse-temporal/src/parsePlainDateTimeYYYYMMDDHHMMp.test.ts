import { Temporal } from "temporal-polyfill";
import { describe, expect, it } from "vitest";

import { parsePlainDateTimeYYYYMMDDHHMMp } from "./parsePlainDateTimeYYYYMMDDHHMMp.js";

describe("parsePlainDateTimeYYYYMMDDHHMMp", () => {
  it("should parse a valid date-time string", () => {
    const dateTime = "2024/12/30 12:50 PM";
    expect(parsePlainDateTimeYYYYMMDDHHMMp(dateTime)).toEqual(
      Temporal.PlainDateTime.from({
        year: 2024,
        month: 12,
        day: 30,
        hour: 12,
        minute: 50,
        second: 0,
      }),
    );
  });

  it("should throw an error for an invalid date-time string", () => {
    const invalidDateTime = "invalid-date-time";
    expect(() => parsePlainDateTimeYYYYMMDDHHMMp(invalidDateTime)).toThrow();
  });

  it("should handle edge cases like leap years", () => {
    const leapYearDateTime = "2024/02/29 12:50 PM";
    expect(parsePlainDateTimeYYYYMMDDHHMMp(leapYearDateTime)).toEqual(
      Temporal.PlainDateTime.from({
        year: 2024,
        month: 2,
        day: 29,
        hour: 0,
        minute: 0,
        second: 0,
      }),
    );
  });
});
