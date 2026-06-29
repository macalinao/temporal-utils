# temporal-utils

A collection of TypeScript utilities for the [TC39 Temporal proposal](https://tc39.es/proposal-temporal/).

All packages rely on the use of [temporal-polyfill](https://github.com/fullcalendar/temporal-polyfill). Packages use `instanceof` checks to determine if a type is supported, so one must ensure to use that exact polyfill.

## Documentation

For more detailed documentation, see the [API docs](https://temporal.ianm.com).

## Packages

| Package                                               | Version                                                                                                                             | Downloads                                                                                                                         | Description                                                                             |
| :---------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [format-temporal](packages/format-temporal)           | [![npm](https://img.shields.io/npm/v/format-temporal.svg?logo=npm&label=)](https://www.npmjs.com/package/format-temporal)           | [![downloads](https://img.shields.io/npm/dm/format-temporal.svg?label=)](https://www.npmjs.com/package/format-temporal)           | Format Temporal objects as localized strings.                                           |
| [interval-temporal](packages/interval-temporal)       | [![npm](https://img.shields.io/npm/v/interval-temporal.svg?logo=npm&label=)](https://www.npmjs.com/package/interval-temporal)       | [![downloads](https://img.shields.io/npm/dm/interval-temporal.svg?label=)](https://www.npmjs.com/package/interval-temporal)       | An interval type for Temporal, plus helpers for comparing and sorting Temporal objects. |
| [parse-temporal](packages/parse-temporal)             | [![npm](https://img.shields.io/npm/v/parse-temporal.svg?logo=npm&label=)](https://www.npmjs.com/package/parse-temporal)             | [![downloads](https://img.shields.io/npm/dm/parse-temporal.svg?label=)](https://www.npmjs.com/package/parse-temporal)             | Parse Temporal objects from strings.                                                    |
| [superjson-temporal](packages/superjson-temporal)     | [![npm](https://img.shields.io/npm/v/superjson-temporal.svg?logo=npm&label=)](https://www.npmjs.com/package/superjson-temporal)     | [![downloads](https://img.shields.io/npm/dm/superjson-temporal.svg?label=)](https://www.npmjs.com/package/superjson-temporal)     | SuperJSON serializers/deserializers for Temporal types.                                 |
| [temporal-quarter-fns](packages/temporal-quarter-fns) | [![npm](https://img.shields.io/npm/v/temporal-quarter-fns.svg?logo=npm&label=)](https://www.npmjs.com/package/temporal-quarter-fns) | [![downloads](https://img.shields.io/npm/dm/temporal-quarter-fns.svg?label=)](https://www.npmjs.com/package/temporal-quarter-fns) | Functions for working with quarters in Temporal.                                        |
| [temporal-zod](packages/temporal-zod)                 | [![npm](https://img.shields.io/npm/v/temporal-zod.svg?logo=npm&label=)](https://www.npmjs.com/package/temporal-zod)                 | [![downloads](https://img.shields.io/npm/dm/temporal-zod.svg?label=)](https://www.npmjs.com/package/temporal-zod)                 | Zod validators for Temporal types.                                                      |

## License

Apache-2.0
