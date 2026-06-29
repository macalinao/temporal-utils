---
"temporal-zod": minor
---

Support custom validation errors (#54).

Every `z<Type>` / `z<Type>Instance` validator now has an `.error(...)` method that
returns a copy of the validator with a customized error, taking Zod's params
object (`{ error }`, a string or an error-map function):

```typescript
zPlainDate.error({ error: "Invalid date" });
zPlainDate.error({ error: (issue) => `Bad: ${issue.input}` });

z.object({ date: zPlainDate.error({ error: "Invalid date" }) });
```

This is **non-breaking** — the plain validators (`zPlainDate`, etc.) are unchanged
and keep their default error. The custom error is reported for any invalid input
(a malformed string or the wrong type), works on both the coercing and instance
validators, and is available on the main `temporal-zod` entry and
`temporal-zod/base`. JSON Schema output for the default validators is unchanged.
