# temporal-zod

<a href="https://www.npmjs.com/package/temporal-zod"><img alt="NPM version" src="https://img.shields.io/npm/v/temporal-zod.svg?style=for-the-badge&labelColor=000000"></a>

Zod validators for Temporal types.

This depends on the [temporal-polyfill](https://www.npmjs.com/package/temporal-polyfill) package.

## Usage

This library exports two Zod validators for each Temporal type: one with type coercion and one without. Use them directly as schemas, or call `.error({ error })` on any of them for a copy with a custom error message (see [Custom errors](#custom-errors)).

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

### Custom errors

Call `.error(...)` on any validator to get a copy with a custom validation error, passing Zod's [`error` param](https://zod.dev/error-customization) — either a string or an error-map function:

```typescript
import * as z from "zod";
import { zPlainDate } from "temporal-zod";

const schema = z.object({
  // string message
  start: zPlainDate.error({ error: "Please provide a valid start date" }),
  // error-map function
  end: zPlainDate.error({
    error: (issue) => `"${String(issue.input)}" is not a valid date`,
  }),
});
```

The custom error is reported for any invalid input (a malformed string or the wrong type), and works on both the coercing and instance validators. The plain `zPlainDate` keeps its default error.

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

const schema = z.object({ date: zPlainDate });
```

These are the same validators (including `.error(...)`), just without the JSON Schema metadata registration side effect.

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
