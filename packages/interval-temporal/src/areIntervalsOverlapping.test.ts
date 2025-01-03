import { Temporal } from "temporal-polyfill";
import { describe, expect, it } from "vitest";

import { areIntervalsOverlapping } from "./areIntervalsOverlapping.js";

describe("areIntervalsOverlapping", () => {
  const base = {
    start: Temporal.ZonedDateTime.from("2023-10-01T10:00:00Z[UTC]"),
    end: Temporal.ZonedDateTime.from("2023-10-02T10:00:00Z[UTC]"),
  };
  const overlaps = {
    start: Temporal.ZonedDateTime.from("2023-10-01T12:00:00Z[UTC]"),
    end: Temporal.ZonedDateTime.from("2023-10-02T12:00:00Z[UTC]"),
  };

  it("should return true when the intervals overlap", () => {
    expect(areIntervalsOverlapping(base, overlaps)).toBe(true);
  });
});
