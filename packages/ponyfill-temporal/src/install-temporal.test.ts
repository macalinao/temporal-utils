import { afterEach, describe, expect, test } from "bun:test";
import { installTemporal } from "./install-temporal.js";
import { isNativeTemporalAvailable } from "./load-temporal.js";

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

describe("installTemporal", () => {
  test("installs the polyfill onto globalThis when native is absent", async () => {
    delete globalRef.Temporal;
    expect(isNativeTemporalAvailable()).toBe(false);

    const api = await installTemporal();

    // Temporal is now globally available.
    expect(isNativeTemporalAvailable()).toBe(true);
    expect(globalRef.Temporal).toBe(api.Temporal);

    const date = api.Temporal.PlainDate.from("2021-06-30");
    expect(date.year).toBe(2021);
  });

  test("leaves a native Temporal untouched", async () => {
    const fakeTemporal = { marker: "native-temporal" };
    globalRef.Temporal = fakeTemporal;

    const api = await installTemporal();

    // The native global is returned and never overwritten.
    expect(api.Temporal as unknown).toBe(fakeTemporal);
    expect(globalRef.Temporal).toBe(fakeTemporal);
  });
});
