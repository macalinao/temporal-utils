import { Temporal } from "ponyfill-temporal";
import { parsePlainDate } from "./parse-plain-date.js";

const WHITESPACE_RE = /\s+/;

/**
 * Parses a date like 2025/01/04 12:50 PM
 * @param date
 */
export const parsePlainDateTimeYYYYMMDDHHMMp = (
  dateTime: string,
): Temporal.PlainDateTime => {
  const [datePart, timePart, amOrPm] = dateTime.split(WHITESPACE_RE);
  if (!(datePart && timePart && amOrPm)) {
    throw new Error("Invalid date of extraction");
  }
  const date = parsePlainDate(datePart, "YMD");
  const [hours, minutes] = timePart.split(":").map(Number);
  if (hours === undefined || minutes === undefined) {
    throw new Error("Invalid date of extraction");
  }
  return date.toPlainDateTime(
    Temporal.PlainTime.from(
      {
        hour: (hours % 12) + (amOrPm === "PM" ? 12 : 0),
        minute: minutes,
      },
      { overflow: "reject" },
    ),
  );
};
