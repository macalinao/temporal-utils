import type { ZodToJsonSchemaConverterOptions } from "@orpc/zod/zod4";
import { describe, expect, test } from "bun:test";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import * as z from "zod";
import {
  DURATION_PATTERN,
  INSTANT_PATTERN,
  PLAIN_DATE_PATTERN,
  zDuration,
  zInstant,
  zInstantInstance,
  zPlainDate,
  zPlainTime,
} from "./json-schemas.js";
import { temporalJsonSchemaInterceptor } from "./orpc.js";

const converter = new ZodToJsonSchemaConverter({
  interceptors: [temporalJsonSchemaInterceptor],
});
// Without the interceptor, to prove it is what fixes the output.
const bareConverter = new ZodToJsonSchemaConverter();

function convert(schema: z.ZodType): Record<string, unknown> {
  const [, json] = converter.convert(schema, { strategy: "input" });
  return json as Record<string, unknown>;
}

describe("temporalJsonSchemaInterceptor", () => {
  /**
   * `orpc.ts` types the interceptor structurally so `temporal-zod` imports
   * nothing from `@orpc/*` — even an `import type` would have to resolve in the
   * shipped `.d.ts`, breaking consumers without `@orpc/zod` who don't set
   * `skipLibCheck`. This assignment is what keeps the structural type honest:
   * it fails to compile if oRPC's real interceptor signature ever drifts.
   */
  test("structural type is assignable to oRPC's interceptor signature", () => {
    const asOrpcInterceptor: NonNullable<
      ZodToJsonSchemaConverterOptions["interceptors"]
    >[number] = temporalJsonSchemaInterceptor;
    expect(asOrpcInterceptor).toBe(temporalJsonSchemaInterceptor);
  });

  test("zInstant converts to a clean string schema with format + pattern", () => {
    expect(convert(zInstant)).toEqual({
      type: "string",
      description:
        "An ISO 8601 instant string with a required UTC offset (e.g. 2023-01-15T13:45:30Z)",
      format: "date-time",
      pattern: INSTANT_PATTERN,
    });
  });

  test("instance variant is fixed too (no id in metadata)", () => {
    expect(convert(zInstantInstance)).toEqual({
      type: "string",
      description:
        "An ISO 8601 instant string with a required UTC offset (e.g. 2023-01-15T13:45:30Z)",
      format: "date-time",
      pattern: INSTANT_PATTERN,
    });
  });

  test("no leftover anyOf and no dangling $ref/id", () => {
    const json = convert(zPlainDate);
    expect(json).not.toHaveProperty("anyOf");
    expect(json).not.toHaveProperty("$ref");
    expect(json).not.toHaveProperty("id");
    expect(json).toMatchObject({
      type: "string",
      format: "date",
      pattern: PLAIN_DATE_PATTERN,
    });
  });

  test("types without a format omit it", () => {
    const json = convert(zPlainTime);
    expect(json).not.toHaveProperty("format");
    expect(json.type).toBe("string");
  });

  test("format: duration is preserved", () => {
    expect(convert(zDuration)).toMatchObject({
      type: "string",
      format: "duration",
      pattern: DURATION_PATTERN,
    });
  });

  test("works inside a z.object()", () => {
    const [, json] = converter.convert(
      z.object({ start: zInstant, span: zDuration }),
      { strategy: "input" },
    );
    expect(json).toMatchObject({
      type: "object",
      properties: {
        start: { type: "string", format: "date-time" },
        span: { type: "string", format: "duration" },
      },
      required: ["start", "span"],
    });
  });

  test("bare converter (no interceptor) produces the broken anyOf output", () => {
    const [, json] = bareConverter.convert(zInstant, { strategy: "input" });
    // Demonstrates why the interceptor is needed: oRPC walks the underlying
    // z.union and loses the format/pattern metadata.
    expect(json).toHaveProperty("anyOf");
    expect(json).not.toHaveProperty("format");
  });

  test("does not touch schemas whose meta has no JSON Schema type", () => {
    const plain = z.string().meta({ examples: ["hello"] });
    const [, json] = converter.convert(plain, { strategy: "input" });
    expect(json).toMatchObject({ type: "string", examples: ["hello"] });
  });
});
