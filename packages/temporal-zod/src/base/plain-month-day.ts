import type { z } from "zod";
import type { ZodTemporal } from "./temporal-validator.js";
import { Temporal } from "temporal-polyfill";
import {
  CALENDAR_PART,
  DATE_PART,
  DAY_PART,
  MONTH_PART,
  OPTIONAL_CALENDAR_PART,
} from "./iso-pattern-parts.js";
import { temporalValidators } from "./temporal-validator.js";

export const PlainMonthDay: typeof Temporal.PlainMonthDay =
  Temporal.PlainMonthDay;

/**
 * Regex pattern for {@link Temporal.PlainMonthDay} ISO 8601 strings (e.g. `--01-15` or `01-15`).
 * Validates month (01–12) and day (01–31). The `--` prefix is optional per ISO 8601.
 *
 * Under a non-ISO calendar `toJSON()` emits a full reference date rather than
 * `MM-DD` (e.g. `1972-12-27[u-ca=hebrew]`), so that form is accepted too — but
 * only with the calendar annotation present, so a bare `2023-01-15` is still
 * rejected.
 */
export const PLAIN_MONTH_DAY_PATTERN: string = `^((--)?${MONTH_PART}-${DAY_PART}${OPTIONAL_CALENDAR_PART}|${DATE_PART}${CALENDAR_PART})$`;

const validators = temporalValidators(PlainMonthDay);

/**
 * Validates or coerces a string to a {@link Temporal.PlainMonthDay}.
 */
export const zPlainMonthDay: ZodTemporal<typeof PlainMonthDay> =
  validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.PlainMonthDay}.
 */
export const zPlainMonthDayInstance: z.ZodType<Temporal.PlainMonthDay> =
  validators.instance;
