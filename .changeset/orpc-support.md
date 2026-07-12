---
"temporal-zod": minor
---

Add oRPC support via a new `temporal-zod/orpc` entry point. It exports
`temporalJsonSchemaInterceptor`, which you pass to oRPC's
`ZodToJsonSchemaConverter` so Temporal validators render as correct string JSON
Schemas (with `format`/`pattern`) instead of the `anyOf` oRPC would otherwise
produce. `@orpc/zod` is an optional peer dependency and only its types are
imported, so there is no new runtime dependency.
