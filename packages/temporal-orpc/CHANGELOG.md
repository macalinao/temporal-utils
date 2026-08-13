# temporal-orpc

## 1.0.0

### Minor Changes

- 33d699a: New package: [oRPC](https://orpc.unnoq.com) support for Temporal types.

  oRPC generates its OpenAPI documents with its own `ZodToJsonSchemaConverter`,
  which re-implements the Zod → JSON Schema conversion rather than calling
  `z.toJSONSchema()`, so the metadata `temporal-zod` attaches to each validator is
  ignored — a Temporal validator is a `z.union([...])` underneath, and the
  converter emits a messy `anyOf` with no `format`/`pattern`.

  `temporal-orpc` exports `temporalJsonSchemaInterceptor`, which you pass to the
  converter so every Temporal validator renders as the correct string schema:

  ```typescript
  import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
  import { temporalJsonSchemaInterceptor } from "temporal-orpc";

  new ZodToJsonSchemaConverter({
    interceptors: [temporalJsonSchemaInterceptor],
  });
  ```

  It rewrites only the schemas in `temporalRegistry` — `temporal-zod`'s own
  validators — so your schemas are left entirely to oRPC, including ones you
  annotate the same way, such as
  `z.string().min(5).meta({ type: "string", format: "email" })`, which keeps the
  `minLength` oRPC derives from its checks.

  `temporal-zod` and `@orpc/zod` are peer dependencies: the interceptor has to
  consult the same registry instance your validators registered into, and it is
  typed against oRPC's own interceptor signature.

### Patch Changes

- Updated dependencies [33d699a]
  - temporal-zod@0.8.0
