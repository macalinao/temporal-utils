/**
 * [oRPC](https://orpc.unnoq.com) support for `temporal-zod`.
 *
 * oRPC's `ZodToJsonSchemaConverter` (from `@orpc/zod/zod4`) does **not** use
 * Zod's own `z.toJSONSchema()`. Instead it re-implements the conversion with its
 * own tree walk, so the `.meta()` JSON Schema that `temporal-zod` attaches to
 * each validator is ignored: a Temporal validator is a `z.union([...])` under the
 * hood, so oRPC emits a messy `anyOf` and drops the `format`/`pattern` metadata.
 *
 * This module fixes that with a single {@link temporalJsonSchemaInterceptor}
 * you pass to the converter:
 *
 * @example
 * ```typescript
 * import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
 * import { OpenAPIGenerator } from "@orpc/openapi";
 * import { temporalJsonSchemaInterceptor } from "temporal-zod/orpc";
 * // Import the main entry once so the JSON Schema metadata is registered.
 * import "temporal-zod";
 *
 * const generator = new OpenAPIGenerator({
 *   schemaConverters: [
 *     new ZodToJsonSchemaConverter({
 *       interceptors: [temporalJsonSchemaInterceptor],
 *     }),
 *   ],
 * });
 * ```
 *
 * `@orpc/zod` is an optional peer dependency: this module only imports its
 * *types*, so it adds no runtime dependency to `temporal-zod`.
 *
 * @module
 * @see {@link https://github.com/macalinao/temporal-utils/tree/master/packages/temporal-zod | temporal-zod on GitHub}
 */
import type { ZodToJsonSchemaConverterOptions } from "@orpc/zod/zod4";
import * as z from "zod";

/**
 * The interceptor type accepted by oRPC's `ZodToJsonSchemaConverter`.
 *
 * Derived from `@orpc/zod`'s own option types so it stays in sync across
 * versions without depending on any non-exported symbol.
 */
export type TemporalSchemaInterceptor = NonNullable<
  ZodToJsonSchemaConverterOptions["interceptors"]
>[number];

/**
 * Makes oRPC's `ZodToJsonSchemaConverter` honor a `temporal-zod` validator's
 * full JSON Schema metadata.
 *
 * oRPC's `interceptors` are onion-middleware around every node's conversion: an
 * interceptor may short-circuit by returning its own `[required, jsonSchema]`
 * instead of calling `next()`, fully replacing the structural conversion (so no
 * leftover `anyOf` from the underlying `z.union`). For any schema whose
 * global-registry metadata carries a JSON Schema `type` — which every
 * `temporal-zod` validator populates — we return that metadata directly, so
 * `zInstant` → `{ type: "string", format: "date-time", pattern, … }`. This is
 * general over every Temporal type (`zPlainDate` → `date`, `zDuration` →
 * `duration`, …).
 *
 * Schemas without a `type` in their metadata (e.g. a consumer's own
 * `.meta({ examples })` / `.meta({ id })`) fall through to `next()` untouched,
 * so oRPC's `$ref` dedup and example rendering are unaffected. The registry `id`
 * is dropped: we inline the schema rather than emit a `$ref` to a `$def` the
 * converter never registers.
 */
export const temporalJsonSchemaInterceptor: TemporalSchemaInterceptor = (
  options,
) => {
  const meta = z.globalRegistry.get(options.schema) as
    | (Record<string, unknown> & { type?: unknown })
    | undefined;
  if (meta && typeof meta.type === "string") {
    const { id: _id, ...jsonSchema } = meta;
    return [true, jsonSchema] as ReturnType<TemporalSchemaInterceptor>;
  }
  return options.next();
};
