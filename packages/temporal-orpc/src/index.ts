/**
 * [oRPC](https://orpc.unnoq.com) support for [`temporal-zod`](https://www.npmjs.com/package/temporal-zod).
 *
 * oRPC's `ZodToJsonSchemaConverter` (from `@orpc/zod/zod4`) does **not** use
 * Zod's own `z.toJSONSchema()`. Instead it re-implements the conversion with its
 * own tree walk, so the `.meta()` JSON Schema that `temporal-zod` attaches to
 * each validator is ignored: a Temporal validator is a `z.union([...])` under the
 * hood, so oRPC emits a messy `anyOf` and drops the `format`/`pattern` metadata.
 *
 * This package fixes that with a single {@link temporalJsonSchemaInterceptor}
 * you pass to the converter. It rewrites only the schemas in `temporalRegistry`
 * — `temporal-zod`'s own validators — and leaves every other node in your schema
 * tree to oRPC.
 *
 * @example
 * ```typescript
 * import { OpenAPIGenerator } from "@orpc/openapi";
 * import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
 * import { temporalJsonSchemaInterceptor } from "temporal-orpc";
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
 * @module
 * @see {@link https://github.com/macalinao/temporal-utils/tree/master/packages/temporal-orpc | temporal-orpc on GitHub}
 */
export {
  type TemporalJsonSchemaInterceptor,
  temporalJsonSchemaInterceptor,
} from "./temporal-json-schema-interceptor.js";
