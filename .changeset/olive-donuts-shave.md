---
"orpc-temporal": minor
---

Add `orpc-temporal`, providing oRPC custom JSON serializers for all eight Temporal types.

Without them, oRPC sends Temporal values as plain ISO strings and never rebuilds them on the receiving end, so a value arrives as a `string` even though its declared type says otherwise. Pass `temporalRPCSerializers` to both the server handler and the client link to round-trip `Instant`, `ZonedDateTime`, `PlainDate`, `PlainTime`, `PlainDateTime`, `PlainYearMonth`, `PlainMonthDay`, and `Duration`, preserving time zones, non-ISO calendars, nanosecond precision, and negative durations.
