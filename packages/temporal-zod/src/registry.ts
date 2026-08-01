/**
 * A dedicated Zod registry holding only `temporal-zod`'s own validators.
 *
 * Every validator exported from `temporal-zod` registers its JSON Schema in two
 * places: Zod's `globalRegistry` via `.meta()`, which is what `z.toJSONSchema()`
 * reads, and {@link temporalRegistry}, which is scoped to this package.
 *
 * The global registry is shared with the whole application, so "has metadata
 * that looks like a JSON Schema" is not a safe test for "is a Temporal
 * validator" — a consumer's own `.meta({ type: "string", format: "email" })`
 * would match just as well. {@link temporalRegistry} answers that question
 * exactly: a schema is in it if and only if `temporal-zod` created it.
 *
 * @example
 * ```typescript
 * import { temporalRegistry, zInstant } from "temporal-zod";
 * import * as z from "zod";
 *
 * temporalRegistry.has(zInstant); // true
 * temporalRegistry.has(z.string()); // false
 * temporalRegistry.get(zInstant); // { type: "string", format: "date-time", … }
 * ```
 *
 * @module
 * @see {@link https://github.com/macalinao/temporal-utils/tree/master/packages/temporal-zod | temporal-zod on GitHub}
 */
import * as z from "zod";

/**
 * The JSON Schema a Temporal validator converts to. Every `temporal-zod`
 * validator is an ISO 8601 string, optionally with a `format` and a `pattern`.
 *
 * This is the value side of {@link temporalRegistry}, and deliberately carries
 * no `id`: the id only exists to drive Zod's `$defs`/`$ref` dedup and belongs to
 * the global registry entry, not to the schema's own shape.
 */
export interface TemporalJsonSchema {
  type: "string";
  description: string;
  format?: string;
  pattern?: string;
}

/**
 * Registry of the Temporal validators defined by `temporal-zod`, mapping each to
 * its {@link TemporalJsonSchema}.
 *
 * Only the validators exported from `temporal-zod` are members. The metadata-free
 * variants from `temporal-zod/base` are not, since they carry no JSON Schema.
 *
 * Use this to recognize Temporal validators inside a schema walk — that is what
 * {@link temporalJsonSchemaInterceptor} does for oRPC — instead of pattern
 * matching on `z.globalRegistry` metadata, which cannot tell our schemas apart
 * from a consumer's.
 */
export const temporalRegistry: z.core.$ZodRegistry<TemporalJsonSchema> =
  z.registry<TemporalJsonSchema>();
