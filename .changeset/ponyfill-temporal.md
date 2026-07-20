---
"ponyfill-temporal": minor
---

Add `ponyfill-temporal`: a ponyfill for the TC39 Temporal API that uses native `globalThis.Temporal` when available and otherwise conditionally loads `temporal-polyfill` via a dynamic `import()`. Types come from the runtime-free `temporal-spec` package (which both this package and `temporal-polyfill` type against), so the native and polyfilled branches share one type. Exposes `loadTemporal()` (pure ponyfill), `installTemporal()` (opt-in global install), and `isNativeTemporalAvailable()`, mirroring the `Temporal` / `Intl` / `toTemporalInstant` export surface.
