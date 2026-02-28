import * as z from "zod";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
declare abstract class Class {
  constructor(..._: unknown[]);
}

/**
 * A Zod validator for a Temporal class which also parses string inputs.
 */
export type ZodTemporal<
  TClass extends typeof Class & {
    from: (arg: string) => InstanceType<TClass>;
  },
> = z.ZodType<InstanceType<TClass>, InstanceType<TClass> | string>;

/**
 * JSON Schema configuration for a Temporal type.
 */
export interface TemporalJSONSchema {
  type: "string";
  id: string;
  description: string;
  pattern?: string;
  format?: string;
}

/**
 * Configures a Zod schema to emit the given JSON Schema representation
 * via `z.toJSONSchema()`, and registers it in the global registry so
 * composed schemas produce `$defs`/`$ref` entries.
 */
function registerJSONSchema(
  schema: z.ZodType,
  jsonSchema: TemporalJSONSchema,
): void {
  schema._zod.toJSONSchema = () => ({ ...jsonSchema });
  z.globalRegistry.add(schema, {
    id: jsonSchema.id,
    description: jsonSchema.description,
  });
}

/**
 * Creates Zod validators for a Temporal class.
 *
 * @param cls - The Temporal class to validate.
 * @param jsonSchema - The JSON Schema representation for this Temporal type.
 * @param extraInputs - Additional Zod schemas to accept as coerce inputs
 *   (e.g. `z.date().transform(...)` for Instant).
 * @returns Two Zod validators for the Temporal class: `coerce` for coercing
 *   strings to the Temporal class, and `instance` for validating that the
 *   value is an instance of the Temporal class.
 */
export function temporalValidators<
  TClass extends typeof Class & {
    from: (arg: string) => InstanceType<TClass>;
  },
>(
  cls: TClass,
  jsonSchema: TemporalJSONSchema,
  extraInputs?: z.ZodType<InstanceType<TClass>>[],
): {
  coerce: ZodTemporal<TClass>;
  instance: z.ZodType<InstanceType<TClass>>;
} {
  const instance = z.instanceof(cls);
  // Only set toJSONSchema on instance (no global registry id) so it
  // doesn't conflict with coerce when both are in the same z.object().
  instance._zod.toJSONSchema = () => ({ ...jsonSchema });

  const members: z.ZodType<InstanceType<TClass>>[] = [
    instance,
    z.string().transform((value, ctx) => {
      try {
        return cls.from(value);
      } catch (error: unknown) {
        ctx.addIssue(
          `Invalid ${cls.name}: ${(error as { message?: string }).message ?? "unknown error"}`,
        );
        return z.NEVER;
      }
    }),
    ...(extraInputs ?? []),
  ];

  const coerce = z.union(
    members as [
      z.ZodType<InstanceType<TClass>>,
      ...z.ZodType<InstanceType<TClass>>[],
    ],
  ) as ZodTemporal<TClass>;
  registerJSONSchema(coerce, jsonSchema);

  return { instance, coerce };
}
