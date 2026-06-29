---
"interval-temporal": patch
"parse-temporal": patch
---

`normalizeIntervals` no longer mutates its input array (it now sorts via
`Array#toSorted`), and `parsePlainDate` throws a clear error on an invalid part
order. These surfaced while migrating the repo's tooling from Biome/ESLint to
oxlint + oxfmt.
