import * as z from "zod";

declare abstract class Class {
  constructor(..._: unknown[]);
}

/**
 * A custom error, mirroring Zod's `error` param (e.g. `z.string({ error })`).
 * Either a string message or an error-map function that receives the issue.
 */
export type TemporalError =
  | string
  | ((issue: z.core.$ZodRawIssue) => string | undefined);

/**
 * Error-customization params accepted by `<validator>.error(...)`, matching
 * Zod's construction params (`{ error }`).
 */
export interface TemporalErrorParams {
  error?: TemporalError;
}

/**
 * A Zod schema augmented with a chainable `.error()` method that returns a copy
 * of the schema with a customized validation error.
 */
export type WithError<S extends z.ZodType> = S & {
  error: (params: TemporalErrorParams) => WithError<S>;
};

/**
 * A Zod validator for a Temporal class which also parses string inputs.
 */
export type ZodTemporal<
  TClass extends typeof Class & {
    from: (arg: string) => InstanceType<TClass>;
  },
> = z.ZodType<InstanceType<TClass>, InstanceType<TClass> | string>;

/**
 * A coercing Temporal validator with a `.error()` method for customizing the
 * validation error.
 */
export type TemporalValidator<
  TClass extends typeof Class & {
    from: (arg: string) => InstanceType<TClass>;
  },
> = WithError<ZodTemporal<TClass>>;

/**
 * An instance-only Temporal validator with a `.error()` method.
 */
export type TemporalInstanceValidator<
  TClass extends typeof Class & {
    from: (arg: string) => InstanceType<TClass>;
  },
> = WithError<z.ZodType<InstanceType<TClass>>>;

/**
 * Creates Zod validators for a Temporal class.
 *
 * @param cls - The Temporal class to validate.
 * @param options - `extraInputs` adds extra coerce inputs (e.g. `z.date()` for
 *   Instant); `error` customizes the validation error (string or error-map
 *   function), matching Zod's `error` param.
 * @returns `coerce` (coerces strings/instances) and `instance` (instances only).
 */
export function temporalValidators<
  TClass extends typeof Class & {
    from: (arg: string) => InstanceType<TClass>;
  },
>(
  cls: TClass,
  options?: {
    extraInputs?: z.ZodType<InstanceType<TClass>>[];
    error?: TemporalError;
  },
): {
  coerce: ZodTemporal<TClass>;
  instance: z.ZodType<InstanceType<TClass>>;
} {
  // Zod's union/instanceof report the surfaced error; thread `error` into both so
  // a custom message appears for any invalid input (bad string or wrong type).
  const params =
    options?.error === undefined ? undefined : { error: options.error };

  const instance = z.instanceof(cls, params);

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
    ...(options?.extraInputs ?? []),
  ];

  const coerce = z.union(
    members as [
      z.ZodType<InstanceType<TClass>>,
      ...z.ZodType<InstanceType<TClass>>[],
    ],
    params,
  ) as ZodTemporal<TClass>;

  return { instance, coerce };
}

/**
 * Augments a schema with a chainable `.error()` method. The schema is built once
 * via `build()`; `.error({ error })` rebuilds it with the custom error so the
 * default validator stays usable directly (e.g. in `z.object({ d: zPlainDate })`).
 */
export function withError<S extends z.ZodType>(
  build: (error?: TemporalError) => S,
  error?: TemporalError,
): WithError<S> {
  const schema = build(error);
  return Object.assign(schema, {
    error: (params: TemporalErrorParams): WithError<S> =>
      withError(build, params.error),
  }) as WithError<S>;
}
