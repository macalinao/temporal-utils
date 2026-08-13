---
"temporal-zod": minor
---

Export `temporalRegistry`, a Zod registry scoped to this package that holds every
validator `temporal-zod` creates along with its JSON Schema. Use it to recognize
Temporal validators in your own schema walks by identity —
`temporalRegistry.has(zInstant)` — instead of pattern matching on
`z.globalRegistry` metadata, which cannot tell our schemas apart from yours. The
metadata-free `temporal-zod/base` validators are not members.

This is what the new [`temporal-orpc`](https://www.npmjs.com/package/temporal-orpc)
package consults to fix Temporal types in oRPC-generated OpenAPI documents.

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
