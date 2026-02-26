import { describe, expect, test } from "bun:test";
import { Temporal } from "temporal-polyfill";
import { sortedTuple } from "./comparators.js";

describe("sortedTuple for ZonedDateTime", () => {
  test("should return 0 for equal ZonedDateTime instances", () => {
    const dateTime1 = Temporal.ZonedDateTime.from("2023-10-01T10:00:00Z[UTC]");
    const dateTime2 = Temporal.ZonedDateTime.from("2023-10-01T10:00:00Z[UTC]");
    expect(sortedTuple(dateTime1, dateTime2)).toEqual([dateTime1, dateTime2]);
  });

  test("should return -1 for an earlier ZonedDateTime", () => {
    const dateTime1 = Temporal.ZonedDateTime.from("2023-10-01T09:00:00Z[UTC]");
    const dateTime2 = Temporal.ZonedDateTime.from("2023-10-01T10:00:00Z[UTC]");
    expect(sortedTuple(dateTime1, dateTime2)).toEqual([dateTime1, dateTime2]);
  });

  test("should return 1 for a later ZonedDateTime", () => {
    const dateTime1 = Temporal.ZonedDateTime.from("2023-10-01T11:00:00Z[UTC]");
    const dateTime2 = Temporal.ZonedDateTime.from("2023-10-01T10:00:00Z[UTC]");
    expect(sortedTuple(dateTime1, dateTime2)).toEqual([dateTime2, dateTime1]);
  });
});
