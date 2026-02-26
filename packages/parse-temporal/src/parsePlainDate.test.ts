import { describe, expect, test } from "bun:test";
import { Temporal } from "temporal-polyfill";
import { parsePlainDate } from "./parsePlainDate.js";

describe("parsePlainDate", () => {
  test("should parse a date", () => {
    expect(parsePlainDate("Nov 12, 2024", "MDY")).toEqual(
      new Temporal.PlainDate(2024, 11, 12),
    );
  });

  test("should parse 23-NOV-24", () => {
    expect(parsePlainDate("23-NOV-24", "DMY")).toEqual(
      new Temporal.PlainDate(2024, 11, 23),
    );
  });

  test("should parse Oct 12, 2024", () => {
    expect(parsePlainDate("Oct 12, 2024", "MDY")).toEqual(
      new Temporal.PlainDate(2024, 10, 12),
    );
  });
});
