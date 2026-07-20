/**
 * The full module shape exported by `@js-temporal/polyfill`. We reuse the
 * polyfill's own types as the source of truth so that consumers get an
 * identical API surface whether Temporal is provided natively or polyfilled.
 */
export type TemporalPolyfillModule = typeof import("@js-temporal/polyfill");

/**
 * The Temporal API surface returned by {@link loadTemporal}.
 *
 * Mirrors the exports of `@js-temporal/polyfill`:
 *
 * - `Temporal` — the Temporal namespace object.
 * - `Intl` — the Temporal-aware `Intl` namespace.
 * - `toTemporalInstant` — the function installed as
 *   `Date.prototype.toTemporalInstant`.
 */
export interface TemporalApi {
  Temporal: TemporalPolyfillModule["Temporal"];
  Intl: TemporalPolyfillModule["Intl"];
  toTemporalInstant: TemporalPolyfillModule["toTemporalInstant"];
}

/**
 * A typed view of `globalThis` when the runtime ships a native Temporal
 * implementation. TypeScript's standard library does not yet declare these
 * globals, so we describe them in terms of the polyfill's types.
 */
interface TemporalGlobal {
  Temporal: TemporalApi["Temporal"];
  Intl: TemporalApi["Intl"];
  Date: {
    prototype: {
      toTemporalInstant: TemporalApi["toTemporalInstant"];
    };
  };
}

/**
 * Returns `true` when the runtime exposes a native `globalThis.Temporal`.
 */
export const isNativeTemporalAvailable = (): boolean =>
  typeof (globalThis as { Temporal?: unknown }).Temporal !== "undefined";

/**
 * Load the Temporal API as a **ponyfill**.
 *
 * When the runtime already exposes a native `globalThis.Temporal`, the native
 * implementation is returned as-is and the polyfill is never loaded. Otherwise
 * `@js-temporal/polyfill` is loaded lazily via a dynamic `import()` and its
 * exports are returned.
 *
 * This function never mutates any globals. If you want polyfill-style global
 * installation, use `installTemporal` instead.
 *
 * @returns The Temporal API surface ({@link TemporalApi}).
 */
export async function loadTemporal(): Promise<TemporalApi> {
  if (isNativeTemporalAvailable()) {
    const nativeGlobal = globalThis as unknown as TemporalGlobal;
    return {
      Temporal: nativeGlobal.Temporal,
      Intl: nativeGlobal.Intl,
      toTemporalInstant: nativeGlobal.Date.prototype.toTemporalInstant,
    };
  }

  const polyfill = await import("@js-temporal/polyfill");
  return {
    Temporal: polyfill.Temporal,
    Intl: polyfill.Intl,
    toTemporalInstant: polyfill.toTemporalInstant,
  };
}
