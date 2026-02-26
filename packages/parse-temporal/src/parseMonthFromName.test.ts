import { describe, expect, test } from "bun:test";
import { parseMonthFromName } from "./parseMonthFromName.js";

describe("parseMonthFromName", () => {
  test("should return the correct month number for valid month names", () => {
    expect(parseMonthFromName("January")).toBe(1);
    expect(parseMonthFromName("February")).toBe(2);
    expect(parseMonthFromName("March")).toBe(3);
    expect(parseMonthFromName("April")).toBe(4);
    expect(parseMonthFromName("May")).toBe(5);
    expect(parseMonthFromName("June")).toBe(6);
    expect(parseMonthFromName("July")).toBe(7);
    expect(parseMonthFromName("August")).toBe(8);
    expect(parseMonthFromName("September")).toBe(9);
    expect(parseMonthFromName("October")).toBe(10);
    expect(parseMonthFromName("November")).toBe(11);
    expect(parseMonthFromName("December")).toBe(12);
  });
});
