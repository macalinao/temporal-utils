---
"ponyfill-temporal": minor
---

Add `ponyfill-temporal`: a ponyfill for the TC39 Temporal API that uses native `globalThis.Temporal` when available and otherwise conditionally loads `@js-temporal/polyfill` via a dynamic `import()`. Exposes `loadTemporal()` (pure ponyfill), `installTemporal()` (opt-in global install), and `isNativeTemporalAvailable()`, mirroring the polyfill's `Temporal` / `Intl` / `toTemporalInstant` export surface.
