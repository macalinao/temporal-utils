import { Temporal } from "temporal-polyfill";

/**
 * Parses a time in HHMM to a {@link Temporal.PlainTime}.
 *
 * E.g.
 * - 1225 -> 12:25
 * - 1321 -> 13:21
 *
 * @param time
 * @returns
 */
export const parsePlainTimeHHMM = (time: string): Temporal.PlainTime => {
  const paddedTime = time.replaceAll(/[^\d]/g, "").padStart(4, "0");
  const [hours, minutes] = [paddedTime.slice(0, 2), paddedTime.slice(2, 4)];
  return Temporal.PlainTime.from(
    {
      hour: Number.parseInt(hours, 10),
      minute: Number.parseInt(minutes, 10),
    },
    { overflow: "reject" },
  );
};
