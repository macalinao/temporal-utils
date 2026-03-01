import { Temporal } from "temporal-polyfill";
import { parseMonthLike } from "./parse-month-like.js";
import { parseYearLike } from "./parse-year-like.js";
import { tokenizeAlphanumeric } from "./utils/tokenize-alphanumeric.js";

export type PlainDatePartOrder = "MDY" | "DMY" | "YMD";

/**
 * Returns year, month. day
 * @param date
 * @param partOrder
 * @returns
 */
const getYMD = (
  date: string,
  partOrder: PlainDatePartOrder,
): [string, string, string] => {
  const parts = tokenizeAlphanumeric(date);
  const [a, b, c] = parts;
  if (!(a && b && c)) {
    throw new Error(`Invalid date: ${date}`);
  }
  // biome-ignore lint/nursery/noUnnecessaryConditions: exhaustive switch
  switch (partOrder) {
    case "MDY":
      return [c, a, b];
    case "DMY":
      return [c, b, a];
    case "YMD":
      return [a, b, c];
  }
};

export const parsePlainDate = (
  date: string,
  partOrder: PlainDatePartOrder = "MDY",
): Temporal.PlainDate => {
  const [yearStr, monthStr, dayStr] = getYMD(date, partOrder);
  const month = parseMonthLike(monthStr);
  const day = Number.parseInt(dayStr, 10);
  const year = parseYearLike(yearStr);
  return new Temporal.PlainDate(year, month, day);
};
