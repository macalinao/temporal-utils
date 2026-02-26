import { Temporal } from "temporal-polyfill";

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
  "Temporal.PlainDate": (a, b) => Temporal.PlainDate.compare(a, b),
  "Temporal.Instant": (a, b) => Temporal.Instant.compare(a, b),
  "Temporal.PlainDateTime": (a, b) => Temporal.PlainDateTime.compare(a, b),
  "Temporal.ZonedDateTime": (a, b) => Temporal.ZonedDateTime.compare(a, b),
  "Temporal.PlainTime": (a, b) => Temporal.PlainTime.compare(a, b),
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
