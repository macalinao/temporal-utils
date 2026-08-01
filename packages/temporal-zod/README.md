# temporal-zod

<a href="https://www.npmjs.com/package/temporal-zod"><img alt="NPM version" src="https://img.shields.io/npm/v/temporal-zod.svg?style=for-the-badge&labelColor=000000"></a>

Zod validators for Temporal types.

This depends on the [temporal-polyfill](https://www.npmjs.com/package/temporal-polyfill) package.

## Usage

This library exports two Zod validators for each Temporal type: one with type coercion and one without.

Strings are coerced to the appropriate Temporal type, and for the `Instant` type, `Date` objects are also coerced to `Instant` objects.

- `zPlainDate`/`zPlainDateInstance` - A Zod validator for the `PlainDate` type.
- `zPlainTime`/`zPlainTimeInstance` - A Zod validator for the `PlainTime` type.
- `zPlainDateTime`/`zPlainDateTimeInstance` - A Zod validator for the `PlainDateTime` type.
- `zPlainYearMonth`/`zPlainYearMonthInstance` - A Zod validator for the `PlainYearMonth` type.
- `zPlainMonthDay`/`zPlainMonthDayInstance` - A Zod validator for the `PlainMonthDay` type.
- `zDuration`/`zDurationInstance` - A Zod validator for the `Duration` type.
- `zInstant`/`zInstantInstance` - A Zod validator for the `Instant` type. This also coerces `Date` objects to `Instant` objects.
- `zZonedDateTime`/`zZonedDateTimeInstance` - A Zod validator for the `ZonedDateTime` type.

### Example

```typescript
import * as z from "zod";
import { zZonedDateTime } from "temporal-zod";

const schema = z.object({
  zonedDateTime: zZonedDateTime,
});

const input = {
  zonedDateTime: "2023-05-15T13:45:30+08:00[Asia/Manila]",
};

const result = schema.parse(input);
// result.zonedDateTime is a ZonedDateTime object
```

You may view the [tests](https://github.com/macalinao/temporal-utils/blob/master/packages/temporal-zod/src/index.test.ts) for more examples.

### JSON Schema Support

The default `temporal-zod` export registers JSON Schema metadata on every validator via Zod's `.meta()`, so `z.toJSONSchema()` works out of the box:

```typescript
import * as z from "zod";
import { zPlainDate, zInstant } from "temporal-zod";

const schema = z.object({
  date: zPlainDate,
  instant: zInstant,
});

const jsonSchema = z.toJSONSchema(schema);
// Produces a JSON Schema with $defs for Temporal.PlainDate, Temporal.Instant,
// including type, description, pattern, and format where applicable.
```

### Base Export (No JSON Schema)

If you don't need JSON Schema support, you can import from `temporal-zod/base` for a smaller bundle. This gives you the same validators without the JSON Schema metadata registration side effect:

```typescript
import { zPlainDate, zInstant } from "temporal-zod/base";
```

This is backwards-compatible with the pre-JSON Schema versions of `temporal-zod`.

### With oRPC

[oRPC](https://orpc.unnoq.com) generates its OpenAPI documents with its own
`ZodToJsonSchemaConverter` (from `@orpc/zod/zod4`), which re-implements the
Zod → JSON Schema conversion instead of calling `z.toJSONSchema()`. Because a
Temporal validator is a `z.union([...])` under the hood, the converter would
otherwise emit a messy `anyOf` and drop the `format`/`pattern` metadata.

`temporal-zod` exports `temporalJsonSchemaInterceptor` to fix this. Pass it to the
converter and every Temporal validator renders as the correct string schema:

```typescript
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { temporalJsonSchemaInterceptor } from "temporal-zod";

const generator = new OpenAPIGenerator({
  schemaConverters: [
    new ZodToJsonSchemaConverter({
      interceptors: [temporalJsonSchemaInterceptor],
    }),
  ],
});
```

`temporal-zod` does not depend on `@orpc/*` at all — not even for types. The
interceptor is typed structurally, so if you don't use oRPC you pay nothing and
nothing needs to resolve.

The interceptor is driven by a registry rather than by a per-type list, so all
eight Temporal types are covered — `Instant`, `ZonedDateTime`, `PlainDate`,
`PlainTime`, `PlainDateTime`, `PlainYearMonth`, `PlainMonthDay`, and `Duration`
— in both the coercing and `*Instance` variants.

It only rewrites schemas that `temporal-zod` itself created. Every validator is
registered in `temporalRegistry`, a Zod registry scoped to this package, and the
interceptor consults that rather than `z.globalRegistry`. Your own schemas are
left entirely to oRPC — including ones you annotate the same way we do, such as
`z.string().min(5).meta({ type: "string", format: "email" })`, which keeps the
`minLength` oRPC derives from its checks.

`temporalRegistry` is exported, so you can use it to recognize Temporal
validators in your own schema walks:

```typescript
import { temporalRegistry, zInstant } from "temporal-zod";

temporalRegistry.has(zInstant); // true
temporalRegistry.get(zInstant); // { type: "string", format: "date-time", … }
```

Values travel as the plain ISO strings `toJSON()` produces, and the validator on
the receiving end revives them. The published `pattern` accepts everything
`toJSON()` can emit, including the `[u-ca=…]` annotation added under a non-ISO
calendar, the full reference-date form `PlainYearMonth` and `PlainMonthDay` take
under such a calendar, and signed six-digit years.

One boundary is worth knowing: `PlainDate` also advertises `format: "date"`,
which is RFC 3339 full-date and cannot carry an annotation. A validator that
asserts `format` will therefore reject a non-ISO `PlainDate` even though the
`pattern` accepts it. The `format` is kept because it is correct and useful for
the ISO case, which is the overwhelmingly common one.

### With tRPC

If you are using [tRPC](https://trpc.io/), you likely use Zod to validate your inputs and outputs. However, when using it with [Tanstack Query](https://tanstack.com/query), since the Temporal types get mapped to an object, you should ensure that you are using the instance of the Temporal type rather than the one with type coercion. Otherwise, the query cache will not work as expected.

To do this, use the instance matcher of the Temporal type rather than the one with type coercion.

That is:

```typescript
// wrong
const procedure = myProcedure.input(
  z.object({
    plainDate: zPlainDate,
  }),
);

// correct
const procedure = myProcedure.input(
  z.object({
    plainDate: zPlainDateInstance,
  }),
);
```

## License

Apache-2.0
