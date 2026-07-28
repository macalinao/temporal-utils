# orpc-temporal

<a href="https://www.npmjs.com/package/orpc-temporal"><img alt="NPM version" src="https://img.shields.io/npm/v/orpc-temporal.svg?style=for-the-badge&labelColor=000000"></a>

[oRPC](https://orpc.unnoq.com/) custom JSON serializers for Temporal types.

This depends on the [temporal-polyfill](https://www.npmjs.com/package/temporal-polyfill) package.

## Why

oRPC has no built-in support for Temporal. Without these serializers, a Temporal
value is stringified by its `toJSON()` during JSON encoding and nothing rebuilds
it on the other end, so it arrives as a plain `string`:

```typescript
const result = await client.getEvent();
result.startsAt instanceof Temporal.ZonedDateTime; // false — it's a string
result.startsAt.add({ hours: 1 }); // TypeError at runtime
```

No error is raised at the boundary, and TypeScript still reports the value as a
Temporal type, so the mismatch surfaces later as a confusing runtime failure.

## Usage

Pass the same serializers to both the server handler and the client link.

```typescript
import { RPCHandler } from "@orpc/server/fetch";
import { RPCLink } from "@orpc/client/fetch";
import { temporalRPCSerializers } from "orpc-temporal";

const handler = new RPCHandler(router, {
  customJsonSerializers: temporalRPCSerializers,
});

const link = new RPCLink({
  url: "https://example.com/rpc",
  customJsonSerializers: temporalRPCSerializers,
});
```

All eight Temporal types are covered:

| Type                      | Wire format                                |
| :------------------------ | :----------------------------------------- |
| `Temporal.Instant`        | `2022-01-28T18:53:00.123456789Z`           |
| `Temporal.ZonedDateTime`  | `2022-01-28T19:53:00+01:00[Europe/Berlin]` |
| `Temporal.PlainDate`      | `2024-02-29`                               |
| `Temporal.PlainTime`      | `01:02:03.123456789`                       |
| `Temporal.PlainDateTime`  | `2024-02-29T01:02:03`                      |
| `Temporal.PlainYearMonth` | `2024-02`                                  |
| `Temporal.PlainMonthDay`  | `02-29`                                    |
| `Temporal.Duration`       | `-P1Y2M3DT4H5M6.789S`                      |

Values are serialized with `toJSON()` and restored with `from()`, so time zones,
non-ISO calendar annotations (`[u-ca=hebrew]`), nanosecond precision, and
negative durations all survive the round trip.

## Type IDs

oRPC identifies each custom serializer by a numeric type ID that is part of the
wire format. Its built-in serializers reserve `0`–`7`, so this package uses
`1000`–`1007` to stay clear of them and of any built-ins oRPC adds later.

If that range collides with your own custom serializers, move it — but both ends
of the connection must use the same base:

```typescript
import { createTemporalRPCSerializers } from "orpc-temporal";

const serializers = createTemporalRPCSerializers({ baseType: 5000 });
```

## License

Apache-2.0
