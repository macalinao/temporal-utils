import type { StandardRPCCustomJsonSerializer } from "@orpc/client/standard";
import { Temporal } from "temporal-polyfill";

/**
 * Every Temporal class serialized by this package exposes `toJSON()` and a
 * static `from()` that accepts the string it produces.
 */
interface TemporalConstructor<TInstance extends { toJSON: () => string }> {
  new (...args: never[]): TInstance;
  from: (value: string) => TInstance;
}

/**
 * oRPC reserves type IDs `0`–`7` for its built-in serializers (bigint, Date,
 * NaN, undefined, URL, RegExp, Set, Map). Temporal IDs start well above that
 * range so they keep working if oRPC adds more built-ins.
 */
export const DEFAULT_TEMPORAL_RPC_SERIALIZER_BASE_TYPE = 1000;

/**
 * Offset of each Temporal type from the base type ID.
 *
 * These offsets are part of the wire format: a client and a server must agree
 * on them, so they are stable across releases. Only the base type ID is
 * configurable — see {@link createTemporalRPCSerializers}.
 */
export const TEMPORAL_RPC_SERIALIZER_TYPE_OFFSETS = {
  INSTANT: 0,
  ZONED_DATE_TIME: 1,
  PLAIN_DATE: 2,
  PLAIN_TIME: 3,
  PLAIN_DATE_TIME: 4,
  PLAIN_YEAR_MONTH: 5,
  PLAIN_MONTH_DAY: 6,
  DURATION: 7,
} as const;

/**
 * Options for {@link createTemporalRPCSerializers}.
 */
export interface CreateTemporalRPCSerializersOptions {
  /**
   * First type ID to assign. Each Temporal type occupies one ID starting here,
   * so this reserves the range `baseType` through `baseType + 7`.
   *
   * Override this only if the default range collides with your own custom
   * serializers. Both ends of the connection must use the same value.
   *
   * @defaultValue {@link DEFAULT_TEMPORAL_RPC_SERIALIZER_BASE_TYPE}
   */
  baseType?: number;
}

const serializerFor = <TInstance extends { toJSON: () => string }>(
  type: number,
  cls: TemporalConstructor<TInstance>,
): StandardRPCCustomJsonSerializer => ({
  type,
  condition: (data) => data instanceof cls,
  // Temporal's `toJSON()` emits an ISO 8601 string that round-trips through
  // `from()` with the calendar and time zone annotations intact.
  serialize: (data: TInstance) => data.toJSON(),
  deserialize: (serialized: string) => cls.from(serialized),
});

/**
 * Creates oRPC custom JSON serializers for all eight Temporal types, using a
 * custom base type ID.
 *
 * Prefer the ready-made {@link temporalRPCSerializers} unless you need to move
 * the type IDs to avoid a collision.
 *
 * @param options - Type ID configuration.
 * @returns Serializers to pass to oRPC's `customJsonSerializers` option.
 */
export function createTemporalRPCSerializers(
  options: CreateTemporalRPCSerializersOptions = {},
): StandardRPCCustomJsonSerializer[] {
  const { baseType = DEFAULT_TEMPORAL_RPC_SERIALIZER_BASE_TYPE } = options;
  const offsets = TEMPORAL_RPC_SERIALIZER_TYPE_OFFSETS;

  return [
    serializerFor(baseType + offsets.INSTANT, Temporal.Instant),
    serializerFor(baseType + offsets.ZONED_DATE_TIME, Temporal.ZonedDateTime),
    serializerFor(baseType + offsets.PLAIN_DATE, Temporal.PlainDate),
    serializerFor(baseType + offsets.PLAIN_TIME, Temporal.PlainTime),
    serializerFor(baseType + offsets.PLAIN_DATE_TIME, Temporal.PlainDateTime),
    serializerFor(baseType + offsets.PLAIN_YEAR_MONTH, Temporal.PlainYearMonth),
    serializerFor(baseType + offsets.PLAIN_MONTH_DAY, Temporal.PlainMonthDay),
    serializerFor(baseType + offsets.DURATION, Temporal.Duration),
  ];
}

/**
 * oRPC custom JSON serializers for all eight Temporal types:
 * `Instant`, `ZonedDateTime`, `PlainDate`, `PlainTime`, `PlainDateTime`,
 * `PlainYearMonth`, `PlainMonthDay`, and `Duration`.
 *
 * Pass the same serializers to both the server handler and the client link.
 * Without them oRPC sends Temporal values as plain ISO strings and the
 * receiving end never rebuilds them — the value arrives as a `string` even
 * though its declared type says otherwise.
 *
 * @example
 * ```typescript
 * import { RPCHandler } from "@orpc/server/fetch";
 * import { RPCLink } from "@orpc/client/fetch";
 * import { temporalRPCSerializers } from "orpc-temporal";
 *
 * const handler = new RPCHandler(router, {
 *   customJsonSerializers: temporalRPCSerializers,
 * });
 *
 * const link = new RPCLink({
 *   url: "https://example.com/rpc",
 *   customJsonSerializers: temporalRPCSerializers,
 * });
 * ```
 */
export const temporalRPCSerializers: StandardRPCCustomJsonSerializer[] =
  createTemporalRPCSerializers();
