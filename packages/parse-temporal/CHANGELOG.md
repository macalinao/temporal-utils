# parse-temporal

## 0.6.1

### Patch Changes

- 57860cb: Fix `parsePlainDateTimeYYYYMMDDHHMMp` parsing `12:05 AM` as noon instead of midnight.

## 0.6.0

### Minor Changes

- d37303c: Consume Temporal through the new `ponyfill-temporal` package instead of depending on `temporal-polyfill` / `temporal-spec` directly. Runtime and type imports now come from `ponyfill-temporal`, which resolves a synchronous Temporal (native when available, `temporal-polyfill` otherwise) via top-level await. The direct `temporal-polyfill` / `temporal-spec` dependencies (including peer dependencies) are removed; `ponyfill-temporal` is now the sole owner of them.

### Patch Changes

- Updated dependencies [1798ec5]
  - ponyfill-temporal@0.1.0

## 0.5.4

### Patch Changes

- 4370c69: `normalizeIntervals` no longer mutates its input array (it now sorts via
  `Array#toSorted`), and `parsePlainDate` throws a clear error on an invalid part
  order. These surfaced while migrating the repo's tooling from Biome/ESLint to
  oxlint + oxfmt.

## 0.5.3

### Patch Changes

- b8d4d2d: Pin `@biomejs/biome` to 2.4.5 to keep CI lint working with `@macalinao/biome-config`, which does not yet support Biome 2.5.

## 0.5.2

### Patch Changes

- 3452230: Fix npm publishing to use trusted publishing via OIDC

## 0.5.1

### Patch Changes

- f3d5140: Update publish config

## 0.5.0

### Minor Changes

- 815c5ea: Support JSONSchema

## 0.4.0

### Minor Changes

- 9195fc9: Upgrade to Zod v4

## 0.3.2

### Patch Changes

- 0f0519c: Update dependencies

## 0.3.1

### Patch Changes

- 9a17427: Allow temporal-polyfill 0.2

## 0.3.0

### Minor Changes

- e253e2b: Update temporal to 0.3.0

## 0.2.0

### Minor Changes

- c726b05: Bump all dependencies

### Patch Changes

- cd8d632: Fix peer deps for parse-temporal temporal-polyfill

## 0.1.0

### Minor Changes

- cc7297a: Bump dependencies

## 0.0.2

### Patch Changes

- 085649e: Add more date parsers
