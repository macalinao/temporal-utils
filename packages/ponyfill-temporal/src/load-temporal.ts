/// <reference types="temporal-spec/global" />

/**
 * The runtime-free, types-only package that models the **native** TC39 Temporal
 * API (`temporal-spec`). Both this ponyfill and `temporal-polyfill` (the runtime
 * fallback) type their exports against `temporal-spec`, so the native and
 * polyfilled `Temporal` / `toTemporalInstant` values share one type and unify
 * with no cast.
 */
export type TemporalSpecModule = typeof import("temporal-spec");

/**
 * The Temporal API surface returned by {@link loadTemporal}.
 *
 * Mirrors the runtime exports of `temporal-polyfill` (which are typed against
 * `temporal-spec`):
 *
 * - `Temporal` — the Temporal namespace object.
 * - `Intl` — the Temporal-aware `Intl` namespace object.
 * - `toTemporalInstant` — the function installed as
 *   `Date.prototype.toTemporalInstant`.
 */
export interface TemporalApi {
  Temporal: TemporalSpecModule["Temporal"];
  Intl: typeof globalThis.Intl;
  toTemporalInstant: TemporalSpecModule["toTemporalInstant"];
}

/**
 * Returns `true` when the runtime exposes a native `globalThis.Temporal`.
 */
export const isNativeTemporalAvailable = (): boolean =>
  typeof globalThis.Temporal !== "undefined";

/**
 * Load the Temporal API as a **ponyfill**.
 *
 * When the runtime already exposes a native `globalThis.Temporal`, the native
 * implementation is returned as-is and the polyfill is never loaded. Otherwise
 * `temporal-polyfill` is loaded lazily via a dynamic `import()` and its exports
 * are returned.
 *
 * This function never mutates any globals. If you want polyfill-style global
 * installation, use `installTemporal` instead.
 *
 * @returns The Temporal API surface ({@link TemporalApi}).
 */
export async function loadTemporal(): Promise<TemporalApi> {
  if (isNativeTemporalAvailable()) {
    // `temporal-spec/global` types these ambient globals, so no cast is needed.
    return {
      Temporal: globalThis.Temporal,
      Intl: globalThis.Intl,
      // `toTemporalInstant` is intentionally the free `(this: Date) => Instant`
      // function (mirroring the polyfill's standalone export); it is never
      // invoked with an implicit `this`, so unbound-method does not apply.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      toTemporalInstant: globalThis.Date.prototype.toTemporalInstant,
    };
  }

  const polyfill = await import("temporal-polyfill");
  // `temporal-spec` types `Intl` as a type-only namespace (no value export), so
  // its runtime `Intl` object must be read through a narrow assertion. The
  // `Temporal` and `toTemporalInstant` values are spec-typed and need no cast.
  const { Intl: polyfillIntl } = polyfill as unknown as Pick<
    TemporalApi,
    "Intl"
  >;
  return {
    Temporal: polyfill.Temporal,
    Intl: polyfillIntl,
    toTemporalInstant: polyfill.toTemporalInstant,
  };
}
