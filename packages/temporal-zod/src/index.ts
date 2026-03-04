/**
 * Zod validators for TC39 Temporal types with full JSON Schema support.
 *
 * @example
 * ```typescript
 * import * as z from "zod";
 * import { zPlainDate, zInstant } from "temporal-zod";
 *
 * const schema = z.object({
 *   date: zPlainDate,
 *   instant: zInstant,
 * });
 *
 * // Parse strings into Temporal objects
 * const result = schema.parse({
 *   date: "2023-01-15",
 *   instant: "2023-01-15T13:45:30Z",
 * });
 *
 * // Generate JSON Schema with proper Temporal type metadata
 * const jsonSchema = z.toJSONSchema(schema);
 * ```
 *
 * @module
 * @see {@link https://github.com/macalinao/temporal-utils/tree/master/packages/temporal-zod | temporal-zod on GitHub}
 */
export * from "./json-schemas.js";
