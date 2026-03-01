import { describe, expect, test } from "bun:test";
import { Temporal } from "temporal-polyfill";
import { getQuarter } from "./index.js";

describe("getQuarter", () => {
  test("returns the quarter of the given date", () => {
    const result = getQuarter(Temporal.PlainDate.from("2014-07-02"));
    expect(result).toBe(3);
  });

  test("accepts PlainYearMonth", () => {
    const result = getQuarter(Temporal.PlainYearMonth.from("2014-04"));
    expect(result).toBe(2);
  });

  test("works on everything", () => {
    expect(getQuarter(Temporal.PlainDateTime.from("2024-03-31T16:00:00"))).toBe(
      1,
    );
    expect(getQuarter(Temporal.PlainDateTime.from("2024-03-31T15:00:00"))).toBe(
      1,
    );
    expect(getQuarter(Temporal.PlainDateTime.from("2024-04-01T04:00:00"))).toBe(
      2,
    );
    expect(getQuarter(Temporal.PlainDateTime.from("2024-04-01T03:00:00"))).toBe(
      2,
    );
  });
});
