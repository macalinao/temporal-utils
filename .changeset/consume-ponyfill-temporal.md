---
"parse-temporal": minor
"format-temporal": minor
"interval-temporal": minor
"temporal-quarter-fns": minor
"superjson-temporal": minor
"temporal-zod": minor
---

Consume Temporal through the new `ponyfill-temporal` package instead of depending on `temporal-polyfill` / `temporal-spec` directly. Runtime and type imports now come from `ponyfill-temporal`, which resolves a synchronous Temporal (native when available, `temporal-polyfill` otherwise) via top-level await. The direct `temporal-polyfill` / `temporal-spec` dependencies (including peer dependencies) are removed; `ponyfill-temporal` is now the sole owner of them.
