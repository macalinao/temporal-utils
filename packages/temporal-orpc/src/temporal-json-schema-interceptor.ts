/**
 * The {@link temporalJsonSchemaInterceptor} that teaches oRPC's
 * `ZodToJsonSchemaConverter` about `temporal-zod`'s validators.
 *
 * @module
 * @see {@link https://github.com/macalinao/temporal-utils/tree/master/packages/temporal-orpc | temporal-orpc on GitHub}
 */
import type { ZodToJsonSchemaConverterOptions } from "@orpc/zod/zod4";
import { temporalRegistry } from "temporal-zod";

/**
 * An interceptor accepted by oRPC's `ZodToJsonSchemaConverter`.
 *
 * Derived from oRPC's own options type rather than restated, so it tracks
 * upstream: a change to the interceptor signature is a type error here instead
 * of a runtime surprise.
 */
export type TemporalJsonSchemaInterceptor = NonNullable<
  ZodToJsonSchemaConverterOptions["interceptors"]
>[number];

/**
 * Makes oRPC's `ZodToJsonSchemaConverter` honor a `temporal-zod` validator's
 * full JSON Schema metadata.
 *
 * oRPC's `interceptors` are onion-middleware around every node's conversion: an
 * interceptor may short-circuit by returning its own `[required, jsonSchema]`
 * instead of calling `next()`, fully replacing the structural conversion (so no
 * leftover `anyOf` from the underlying `z.union`). For a schema in
 * `temporalRegistry` we return its registered JSON Schema directly, so
 * `zInstant` → `{ type: "string", format: "date-time", pattern, … }`. This is
 * general over every Temporal type (`zPlainDate` → `date`, `zDuration` →
 * `duration`, …).
 *
 * The lookup is scoped to `temporal-zod`'s own registry rather than
 * `z.globalRegistry`. The global registry is shared with the whole application,
 * so matching on the shape of its metadata would also short-circuit a
 * consumer's own `.meta({ type: "string", format: "email" })` — replacing its
 * structural conversion and silently dropping the constraints oRPC derives from
 * the schema's checks. Every other schema, annotated or not, falls through to
 * `next()` untouched, leaving oRPC's `$ref` dedup and example rendering alone.
 *
 * @example
 * ```typescript
 * new ZodToJsonSchemaConverter({
 *   interceptors: [temporalJsonSchemaInterceptor],
 * });
 * ```
 */
export const temporalJsonSchemaInterceptor: TemporalJsonSchemaInterceptor = (
  options,
) => {
  const jsonSchema = temporalRegistry.get(options.schema);
  if (jsonSchema) {
    // Copy so a consumer mutating the emitted document can't corrupt the
    // registry entry shared by every conversion.
    return [true, { ...jsonSchema }];
  }
  return options.next();
};
