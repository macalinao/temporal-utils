# temporal-orpc

<a href="https://www.npmjs.com/package/temporal-orpc"><img alt="NPM version" src="https://img.shields.io/npm/v/temporal-orpc.svg?style=for-the-badge&labelColor=000000"></a>

[oRPC](https://orpc.unnoq.com) support for Temporal types, via [`temporal-zod`](https://www.npmjs.com/package/temporal-zod).

## The problem

oRPC generates its OpenAPI documents with its own `ZodToJsonSchemaConverter`
(from `@orpc/zod/zod4`), which re-implements the Zod → JSON Schema conversion
instead of calling `z.toJSONSchema()`. The JSON Schema metadata `temporal-zod`
attaches to each validator is therefore ignored, and because a Temporal
validator is a `z.union([...])` under the hood, the converter emits a messy
`anyOf` and drops the `format`/`pattern`.

## Usage

```sh
bun add temporal-orpc temporal-zod
```

Pass `temporalJsonSchemaInterceptor` to the converter, and every Temporal
validator renders as the correct string schema:

```typescript
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { temporalJsonSchemaInterceptor } from "temporal-orpc";

const generator = new OpenAPIGenerator({
  schemaConverters: [
    new ZodToJsonSchemaConverter({
      interceptors: [temporalJsonSchemaInterceptor],
    }),
  ],
});
```

So a procedure taking `zInstant` now documents itself as:

```json
{
  "type": "string",
  "format": "date-time",
  "pattern": "…",
  "description": "An ISO 8601 instant string with a required UTC offset (e.g. 2023-01-15T13:45:30Z)"
}
```

The interceptor is driven by `temporal-zod`'s registry rather than by a per-type
list, so all eight Temporal types are covered — `Instant`, `ZonedDateTime`,
`PlainDate`, `PlainTime`, `PlainDateTime`, `PlainYearMonth`, `PlainMonthDay`, and
`Duration` — in both the coercing and `*Instance` variants.

## What it leaves alone

Only schemas that `temporal-zod` itself created are rewritten. The interceptor
consults `temporalRegistry` — a Zod registry scoped to `temporal-zod` — rather
than `z.globalRegistry`, which is shared with your whole application. Your own
schemas are left entirely to oRPC, including ones you annotate the same way, such
as `z.string().min(5).meta({ type: "string", format: "email" })`, which keeps the
`minLength` oRPC derives from its checks. `$ref` dedup and example rendering are
untouched.

## Procedure inputs

Prefer the `*Instance` validators in procedure inputs and outputs if you use
[Tanstack Query](https://tanstack.com/query): a coerced Temporal value is a fresh
object every time, so the query cache will not compare as you expect. See the
[`temporal-zod` README](https://github.com/macalinao/temporal-utils/tree/master/packages/temporal-zod#with-trpc)
for the same caveat under tRPC.

## License

Apache-2.0
