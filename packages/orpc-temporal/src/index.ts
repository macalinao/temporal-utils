/**
 * oRPC custom JSON serializers for Temporal types.
 *
 * @example
 * ```typescript
 * import { temporalRPCSerializers } from "orpc-temporal";
 *
 * const handler = new RPCHandler(router, {
 *   customJsonSerializers: temporalRPCSerializers,
 * });
 * ```
 *
 * @module
 * @see {@link https://github.com/macalinao/temporal-utils/tree/master/packages/orpc-temporal | orpc-temporal on GitHub}
 */
export type { CreateTemporalRPCSerializersOptions } from "./temporal-rpc-serializers.js";
export {
  createTemporalRPCSerializers,
  DEFAULT_TEMPORAL_RPC_SERIALIZER_BASE_TYPE,
  TEMPORAL_RPC_SERIALIZER_TYPE_OFFSETS,
  temporalRPCSerializers,
} from "./temporal-rpc-serializers.js";
