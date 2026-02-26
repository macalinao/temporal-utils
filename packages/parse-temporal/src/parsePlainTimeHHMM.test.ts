import { describe, expect, test } from "bun:test";
import { Temporal } from "temporal-polyfill";
import { parsePlainTimeHHMM } from "./parsePlainTimeHHMM.js";

describe("parsePlainTimeHHMM", () => {
  test("should work for normal times", () => {
    const time = "1225";
    expect(parsePlainTimeHHMM(time)).toEqual(
      Temporal.PlainTime.from({
        hour: 12,
        minute: 25,
      }),
    );
  });

  test("should allow for separators", () => {
    const time = "12:25";
    expect(parsePlainTimeHHMM(time)).toEqual(
      Temporal.PlainTime.from({
        hour: 12,
        minute: 25,
      }),
    );
  });

  test("should work for times in 12AM", () => {
    const time = "56";
    expect(parsePlainTimeHHMM(time)).toEqual(
      Temporal.PlainTime.from({
        hour: 0,
        minute: 56,
      }),
    );
  });

  test("should fail on invalid times", () => {
    expect(() => parsePlainTimeHHMM("5682")).toThrow();
  });
});
