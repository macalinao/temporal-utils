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
 * import { OpenAPIGenerator } from "@orpc/openapi";
 * import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
 * import { temporalJsonSchemaInterceptor } from "temporal-zod";
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
 * This module deliberately imports **nothing** from `@orpc/*` — not even types.
 * {@link TemporalSchemaInterceptor} is typed structurally, so it is assignable to
 * oRPC's `interceptors` option without `temporal-zod` depending on oRPC at all.
 * A `import type` would still have to resolve in the shipped `.d.ts`, which would
 * break consumers who don't install `@orpc/zod` and don't set `skipLibCheck`.
 * The compatibility of this structural type with oRPC's real one is asserted in
 * `orpc.test.ts`, where `@orpc/zod` is available as a dev dependency.
 *
 * @module
 * @see {@link https://github.com/macalinao/temporal-utils/tree/master/packages/temporal-zod | temporal-zod on GitHub}
 */
import * as z from "zod";

/**
 * The JSON Schema a Temporal validator converts to. Every `temporal-zod`
 * validator is an ISO 8601 string, optionally with a `format` and a `pattern`.
 */
export interface TemporalJsonSchema {
  type: "string";
  description?: string;
  format?: string;
  pattern?: string;
}

/**
 * The subset of oRPC's interceptor context that {@link temporalJsonSchemaInterceptor}
 * actually uses. oRPC passes additional fields (`options`, `lazyDepth`,
 * `isHandledCustomJSONSchema`); they are accepted and ignored.
 */
export interface TemporalSchemaInterceptorOptions<TResult> {
  schema: z.core.$ZodType;
  next: () => TResult;
}

/**
 * Structural type for an interceptor accepted by oRPC's `ZodToJsonSchemaConverter`.
 *
 * Generic over oRPC's result tuple so it stays assignable without naming any
 * `@orpc/*` type. See the module docs for why this is not imported from oRPC.
 */
export type TemporalSchemaInterceptor = <
  TResult extends [required: boolean, jsonSchema: unknown],
>(
  options: TemporalSchemaInterceptorOptions<TResult>,
) => TResult | [required: true, jsonSchema: TemporalJsonSchema];

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
 *
 * @example
 * ```typescript
 * new ZodToJsonSchemaConverter({
 *   interceptors: [temporalJsonSchemaInterceptor],
 * });
 * ```
 */
export const temporalJsonSchemaInterceptor: TemporalSchemaInterceptor = (
  options,
) => {
  const meta = z.globalRegistry.get(options.schema) as
    | (Record<string, unknown> & { type?: unknown })
    | undefined;
  if (meta && typeof meta.type === "string") {
    const { id: _id, ...jsonSchema } = meta;
    return [true, jsonSchema as unknown as TemporalJsonSchema];
  }
  return options.next();
};
