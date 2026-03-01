const monthMap: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

/**
 * Parses a month name to a number.
 * @param month
 * @returns
 */
export const parseMonthFromName = (month: string): number | null => {
  const lowerCaseMonth = month.slice(0, 3).toLowerCase();
  return monthMap[lowerCaseMonth] ?? null;
};
