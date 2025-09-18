import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class, @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
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
> = z.ZodType<InstanceType<TClass>>;

/**
 * Creates Zod validators for a Temporal class.
 *
 * @param cls - The Temporal class to validate.
 * @returns Two Zod validators for the Temporal class: `coerce` for coercing strings to the Temporal class, and `instance` for validating that the value is an instance of the Temporal class.
 */
export function temporalValidators<
  TClass extends typeof Class & {
    from: (arg: string) => InstanceType<TClass>;
  },
>(
  cls: TClass,
): { coerce: ZodTemporal<TClass>; instance: z.ZodType<InstanceType<TClass>> } {
  const instance = z.instanceof(cls);
  return {
    instance,
    coerce: z.union([
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
    ]),
  };
}
