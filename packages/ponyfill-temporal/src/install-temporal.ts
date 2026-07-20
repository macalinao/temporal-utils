import type { TemporalApi } from "./load-temporal.js";
import { isNativeTemporalAvailable, loadTemporal } from "./load-temporal.js";

/**
 * A minimal typed view of the mutable `globalThis` used by
 * {@link installTemporal} when installing the polyfill.
 */
interface MutableTemporalGlobal {
  Temporal?: TemporalApi["Temporal"];
  Date: {
    prototype: {
      toTemporalInstant?: TemporalApi["toTemporalInstant"];
    };
  };
}

/**
 * Install the Temporal API onto `globalThis` (polyfill-style side effect).
 *
 * If the runtime already exposes a native `globalThis.Temporal`, nothing is
 * mutated and the native API is returned. Otherwise `temporal-polyfill` is
 * loaded lazily and assigned to `globalThis.Temporal` and
 * `Date.prototype.toTemporalInstant`.
 *
 * Prefer {@link loadTemporal} when you do not need global mutation — it keeps
 * the default path a pure ponyfill.
 *
 * @returns The Temporal API surface ({@link TemporalApi}) that is now available
 *   on `globalThis`.
 */
export async function installTemporal(): Promise<TemporalApi> {
  const api = await loadTemporal();

  if (!isNativeTemporalAvailable()) {
    const target = globalThis as unknown as MutableTemporalGlobal;
    target.Temporal = api.Temporal;
    target.Date.prototype.toTemporalInstant = api.toTemporalInstant;
  }

  return api;
}
