import { Temporal } from "temporal-polyfill";
import { parsePlainDate } from "./parsePlainDate.js";

/**
 * Parses a date like 2025/01/04 12:50 PM
 * @param date
 */
export const parsePlainDateTimeYYYYMMDDHHMMp = (
  dateTime: string,
): Temporal.PlainDateTime => {
  const [datePart, timePart, amOrPm] = dateTime.split(/\s+/);
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
        hour: hours + (amOrPm === "PM" && hours < 12 ? 12 : 0),
        minute: minutes,
      },
      { overflow: "reject" },
    ),
  );
};
