/**
 * Base Temporal Zod validators **without** JSON Schema metadata.
 *
 * Import from `temporal-zod/base` for a smaller bundle when you don't need
 * `z.toJSONSchema()` support. The validators are functionally identical to
 * the main `temporal-zod` export — they just lack the `.meta()` registration.
 *
 * @example
 * ```typescript
 * import { zPlainDate, zInstant } from "temporal-zod/base";
 *
 * const result = zPlainDate.parse("2023-01-15");
 * // result is a Temporal.PlainDate instance
 * ```
 *
 * @module
 * @see {@link https://github.com/macalinao/temporal-utils/tree/master/packages/temporal-zod | temporal-zod on GitHub}
 */
export type { ZodTemporal } from "./temporal-validator.js";
export * from "./duration.js";
export * from "./instant.js";
export * from "./plain-date.js";
export * from "./plain-date-time.js";
export * from "./plain-month-day.js";
export * from "./plain-time.js";
export * from "./plain-year-month.js";
export * from "./zoned-date-time.js";
