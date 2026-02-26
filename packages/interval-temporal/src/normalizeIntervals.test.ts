import type { Interval } from "./interval.js";
import { describe, expect, test } from "bun:test";
import { Temporal } from "temporal-polyfill";
import { normalizeIntervals } from "./normalizeIntervals.js";

const toPlainTimeIntervals = (
  ranges: { start: string; end: string }[],
): Interval<Temporal.PlainTime>[] =>
  ranges.map(({ start, end }) => ({
    start: Temporal.PlainTime.from(start),
    end: Temporal.PlainTime.from(end),
  }));

describe("normalizeIntervals", () => {
  test("should return an empty array when given an empty array", () => {
    const result = normalizeIntervals([]);
    expect(result).toEqual([]);
  });

  test("should return the same range when given a single range", () => {
    const input: Interval<Temporal.PlainTime>[] = toPlainTimeIntervals([
      { start: "09:00", end: "17:00" },
    ]);
    const result = normalizeIntervals(input);
    expect(result).toEqual(input);
  });

  test("should combine overlapping ranges", () => {
    const input = toPlainTimeIntervals([
      { start: "09:00", end: "12:00" },
      { start: "11:00", end: "14:00" },
      { start: "13:00", end: "17:00" },
    ]);
    const expected = toPlainTimeIntervals([{ start: "09:00", end: "17:00" }]);
    const result = normalizeIntervals(input);
    expect(result).toEqual(expected);
  });

  test("should not combine non-overlapping ranges", () => {
    const input = toPlainTimeIntervals([
      { start: "09:00", end: "11:00" },
      { start: "13:00", end: "15:00" },
      { start: "17:00", end: "19:00" },
    ]);
    const expected = toPlainTimeIntervals([
      { start: "09:00", end: "11:00" },
      { start: "13:00", end: "15:00" },
      { start: "17:00", end: "19:00" },
    ]);
    const result = normalizeIntervals(input);
    expect(result).toEqual(expected);
  });

  test("should sort ranges by start time", () => {
    const input = toPlainTimeIntervals([
      { start: "13:00", end: "15:00" },
      { start: "09:00", end: "11:00" },
      { start: "17:00", end: "19:00" },
    ]);
    const expected = toPlainTimeIntervals([
      { start: "09:00", end: "11:00" },
      { start: "13:00", end: "15:00" },
      { start: "17:00", end: "19:00" },
    ]);
    const result = normalizeIntervals(input);
    expect(result).toEqual(expected);
  });

  test("should handle adjacent ranges", () => {
    const input = toPlainTimeIntervals([
      { start: "09:00", end: "11:00" },
      { start: "11:00", end: "13:00" },
      { start: "13:00", end: "15:00" },
    ]);
    const expected = toPlainTimeIntervals([{ start: "09:00", end: "15:00" }]);
    const result = normalizeIntervals(input);
    expect(result).toEqual(expected);
  });

  test("works with contained ranges", () => {
    const input = toPlainTimeIntervals([
      { start: "09:00", end: "17:00" },
      { start: "12:00", end: "14:00" }, // Overlapping range
      { start: "18:00", end: "22:00" },
    ]);
    const expected = toPlainTimeIntervals([
      { start: "09:00", end: "17:00" },
      { start: "18:00", end: "22:00" },
    ]);
    const result = normalizeIntervals(input);
    expect(result).toEqual(expected);
  });
});
