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

Also export `temporalRegistry`, a Zod registry scoped to this package that holds
every validator `temporal-zod` creates along with its JSON Schema. The
interceptor consults it rather than `z.globalRegistry`, so it rewrites only our
own types and leaves your schemas — including ones you annotate the same way,
such as `z.string().min(5).meta({ type: "string", format: "email" })` — entirely
to oRPC. Use it to recognize Temporal validators in your own schema walks:
`temporalRegistry.has(zInstant)`.

Widen the exported `*_PATTERN` regexes to accept everything `toJSON()` can emit,
which matters now that they are published as an OpenAPI contract. They previously
rejected strings the validators themselves parse:

- The `[u-ca=…]` annotation appended under a non-ISO calendar, for `PlainDate`,
  `PlainDateTime`, `PlainYearMonth`, `PlainMonthDay`, and `ZonedDateTime`.
- The full reference-date form `PlainYearMonth` and `PlainMonthDay` serialize to
  under a non-ISO calendar (e.g. `2022-12-25[u-ca=hebrew]`). A bare calendar date
  is still rejected for both, since the annotation is required in that form.
- Signed six-digit years for years outside 0000–9999 (e.g. `-000753-04-21`).

`ZONED_DATE_TIME_PATTERN` also no longer ends in `\[.+\]`, whose greedy `.+`
spanned both bracket groups and accepted malformed annotations such as
`[not a time zone!][]`.

Note that `PlainDate` still advertises `format: "date"`, which is RFC 3339
full-date and cannot carry an annotation, so a validator that asserts `format`
will reject a non-ISO `PlainDate` even though the `pattern` accepts it.
