import type { z } from "zod";
import type { ZodTemporal } from "./temporal-validator.js";
import { Temporal } from "ponyfill-temporal";
import {
  CALENDAR_PART,
  DATE_PART,
  MONTH_PART,
  OPTIONAL_CALENDAR_PART,
  YEAR_PART,
} from "./iso-pattern-parts.js";
import { temporalValidators } from "./temporal-validator.js";

export const PlainYearMonth: typeof Temporal.PlainYearMonth =
  Temporal.PlainYearMonth;

/**
 * Regex pattern for {@link Temporal.PlainYearMonth} ISO 8601 strings (e.g. `2023-01`).
 * Validates month (01–12).
 *
 * Under a non-ISO calendar `toJSON()` emits a full reference date rather than
 * `YYYY-MM` (e.g. `2022-12-25[u-ca=hebrew]`), so that form is accepted too —
 * but only with the calendar annotation present, so a bare `2023-01-15` is
 * still rejected.
 */
export const PLAIN_YEAR_MONTH_PATTERN =
  // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- tsc isolatedDeclarations (TS9010) requires it
  `^(${YEAR_PART}-${MONTH_PART}${OPTIONAL_CALENDAR_PART}|${DATE_PART}${CALENDAR_PART})$` as string;

const validators = temporalValidators(PlainYearMonth);

/**
 * Validates or coerces a string to a {@link Temporal.PlainYearMonth}.
 */
export const zPlainYearMonth: ZodTemporal<typeof PlainYearMonth> =
  validators.coerce;

/**
 * Validates that the value is an instance of {@link Temporal.PlainYearMonth}.
 */
export const zPlainYearMonthInstance: z.ZodType<Temporal.PlainYearMonth> =
  validators.instance;
