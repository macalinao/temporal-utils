import { afterEach, describe, expect, test } from "bun:test";
import { isNativeTemporalAvailable, loadTemporal } from "./load-temporal.js";

const globalRef = globalThis as { Temporal?: unknown };
const originalTemporal = globalRef.Temporal;

function restoreTemporal(): void {
  if (originalTemporal === undefined) {
    delete globalRef.Temporal;
  } else {
    globalRef.Temporal = originalTemporal;
  }
}

afterEach(() => {
  restoreTemporal();
});

describe("isNativeTemporalAvailable", () => {
  test("reflects the presence of globalThis.Temporal", () => {
    delete globalRef.Temporal;
    expect(isNativeTemporalAvailable()).toBe(false);

    globalRef.Temporal = { marker: "native" };
    expect(isNativeTemporalAvailable()).toBe(true);
  });
});

describe("loadTemporal", () => {
  test("returns native Temporal when globalThis.Temporal is defined", async () => {
    const fakeTemporal = { marker: "native-temporal" };
    globalRef.Temporal = fakeTemporal;

    const api = await loadTemporal();

    // The native global is returned as-is; the polyfill is never consulted.
    expect(api.Temporal as unknown).toBe(fakeTemporal);
  });

  test("falls back to the polyfill when globalThis.Temporal is absent", async () => {
    delete globalRef.Temporal;

    const api = await loadTemporal();

    // The polyfill provides a fully working Temporal implementation.
    const date = api.Temporal.PlainDate.from("2020-01-15");
    expect(date.year).toBe(2020);
    expect(date.month).toBe(1);
    expect(date.day).toBe(15);
    expect(typeof api.toTemporalInstant).toBe("function");
    expect(api.Intl).toBeDefined();

    // Loading the polyfill must not have mutated the global.
    expect(isNativeTemporalAvailable()).toBe(false);
  });
});
