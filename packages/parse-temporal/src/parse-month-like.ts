import { parseMonthFromName } from "./parse-month-from-name.js";

export const parseMonthLike = (monthLike: string): number => {
  const month = parseMonthFromName(monthLike) ?? Number.parseInt(monthLike, 10);
  if (Number.isNaN(month)) {
    throw new Error(`Invalid month: ${monthLike}`);
  }
  return month;
};
