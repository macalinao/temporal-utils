---
"temporal-zod": minor
---

Add oRPC support: `temporal-zod` now exports `temporalJsonSchemaInterceptor`,
which you pass to oRPC's `ZodToJsonSchemaConverter` so Temporal validators render
as correct string JSON Schemas (with `format`/`pattern`) instead of the `anyOf`
oRPC would otherwise produce.

`temporal-zod` takes on no dependency on `@orpc/*` — not even a type-only one.
The interceptor is typed structurally, so consumers who don't use oRPC pay
nothing and nothing needs to resolve at typecheck time.
