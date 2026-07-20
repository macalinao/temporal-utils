# ponyfill-temporal

<a href="https://www.npmjs.com/package/ponyfill-temporal"><img alt="NPM version" src="https://img.shields.io/npm/v/ponyfill-temporal.svg?style=for-the-badge&labelColor=000000"></a>

A **ponyfill** for the [TC39 Temporal API](https://tc39.es/proposal-temporal/docs/).

It uses the runtime's native `globalThis.Temporal` when available, and otherwise
**conditionally loads** [`@js-temporal/polyfill`](https://www.npmjs.com/package/@js-temporal/polyfill)
via a dynamic `import()`. The polyfill is only pulled into your bundle/runtime
when native Temporal is absent.

## Ponyfill vs. polyfill

A **polyfill** mutates the global environment (e.g. it assigns
`globalThis.Temporal`). A **ponyfill** provides the same functionality without
touching any globals — you import what you need and use it directly.

`ponyfill-temporal` is a ponyfill by default: `loadTemporal()` returns the
Temporal API without mutating `globalThis`. If native Temporal already exists,
the polyfill is never even loaded, so runtimes that ship Temporal pay zero cost.
A polyfill-style convenience (`installTemporal()`) is also provided for the rare
case where you genuinely want the global side effect.

## Installation

```sh
npm install ponyfill-temporal
# or
bun add ponyfill-temporal
```

`@js-temporal/polyfill` is a dependency, but it is only ever evaluated (via a
lazy dynamic `import()`) when the runtime does not provide native Temporal.

## Usage

### `loadTemporal()` — the pure ponyfill (recommended)

```ts
import { loadTemporal } from "ponyfill-temporal";

const { Temporal, Intl, toTemporalInstant } = await loadTemporal();

const today = Temporal.Now.plainDateISO();
console.log(today.toString());
```

`loadTemporal()` returns the same export surface as `@js-temporal/polyfill`:

| Export              | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| `Temporal`          | The Temporal namespace object.                                |
| `Intl`              | The Temporal-aware `Intl` namespace.                          |
| `toTemporalInstant` | The function installed as `Date.prototype.toTemporalInstant`. |

Because loading is asynchronous (the polyfill is imported lazily), `loadTemporal`
returns a `Promise`. Resolve it once at startup and share the result.

### `isNativeTemporalAvailable()`

```ts
import { isNativeTemporalAvailable } from "ponyfill-temporal";

if (isNativeTemporalAvailable()) {
  // Running on a runtime that ships Temporal natively.
}
```

### `installTemporal()` — polyfill-style global install (opt-in)

```ts
import { installTemporal } from "ponyfill-temporal";

// Assigns globalThis.Temporal (and Date.prototype.toTemporalInstant)
// only if native Temporal is not already present.
await installTemporal();

// Now available globally.
const now = Temporal.Now.instant();
```

Prefer `loadTemporal()` unless you specifically need the global side effect.

## Why conditional loading?

Importing `@js-temporal/polyfill` unconditionally would always ship the polyfill,
defeating the purpose on runtimes that already implement Temporal. `loadTemporal`
checks `typeof globalThis.Temporal` first and only performs
`await import("@js-temporal/polyfill")` when native Temporal is missing — so the
polyfill stays out of the hot path (and, with a bundler that supports it, out of
the initial chunk) whenever the platform provides Temporal.

## License

Apache-2.0
