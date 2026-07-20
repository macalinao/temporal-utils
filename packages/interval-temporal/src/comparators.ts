import { Temporal } from "ponyfill-temporal";

/**
 * A temporal type that can be compared to itself.
 */
export type TemporalComparable =
  | Temporal.PlainDate
  | Temporal.Instant
  | Temporal.PlainDateTime
  | Temporal.PlainTime
  | Temporal.ZonedDateTime;

export type TemporalComparableStringTag =
  TemporalComparable[typeof Symbol.toStringTag];

type TemporalComparableWithStringTag<T extends TemporalComparableStringTag> =
  TemporalComparable & {
    [Symbol.toStringTag]: T;
  };

export const getTemporalType = (
  value: TemporalComparable,
): TemporalComparableStringTag => value[Symbol.toStringTag];

export type TemporalComparator<T extends TemporalComparable> = (
  a: T,
  b: T,
) => -1 | 0 | 1;

export const TEMPORAL_COMPARATORS: {
  [TTag in TemporalComparableStringTag]: TemporalComparator<
    TemporalComparableWithStringTag<TTag>
  >;
} = {
  // `Temporal.X.compare` is typed as returning `number` in `temporal-spec`, but
  // it always yields -1, 0, or 1 at runtime, so we narrow it to the comparator's
  // result type.
  "Temporal.PlainDate": (a, b) =>
    Temporal.PlainDate.compare(a, b) as -1 | 0 | 1,
  "Temporal.Instant": (a, b) => Temporal.Instant.compare(a, b) as -1 | 0 | 1,
  "Temporal.PlainDateTime": (a, b) =>
    Temporal.PlainDateTime.compare(a, b) as -1 | 0 | 1,
  "Temporal.ZonedDateTime": (a, b) =>
    Temporal.ZonedDateTime.compare(a, b) as -1 | 0 | 1,
  "Temporal.PlainTime": (a, b) =>
    Temporal.PlainTime.compare(a, b) as -1 | 0 | 1,
};

export const compareTemporals = <T extends TemporalComparable>(
  a: T,
  b: T,
): -1 | 0 | 1 =>
  (TEMPORAL_COMPARATORS[a[Symbol.toStringTag]] as TemporalComparator<T>)(a, b);

export const sortedTuple = <T extends TemporalComparable>(
  a: T,
  b: T,
): [T, T] => {
  return compareTemporals(a, b) === 1 ? [b, a] : [a, b];
};
