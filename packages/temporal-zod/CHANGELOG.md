# temporal-zod

## 0.7.0

### Minor Changes

- d37303c: Consume Temporal through the new `ponyfill-temporal` package instead of depending on `temporal-polyfill` / `temporal-spec` directly. Runtime and type imports now come from `ponyfill-temporal`, which resolves a synchronous Temporal (native when available, `temporal-polyfill` otherwise) via top-level await. The direct `temporal-polyfill` / `temporal-spec` dependencies (including peer dependencies) are removed; `ponyfill-temporal` is now the sole owner of them.

### Patch Changes

- Updated dependencies [1798ec5]
  - ponyfill-temporal@0.1.0

## 0.6.3

### Patch Changes

- b8d4d2d: Pin `@biomejs/biome` to 2.4.5 to keep CI lint working with `@macalinao/biome-config`, which does not yet support Biome 2.5.

## 0.6.2

### Patch Changes

- 3452230: Fix npm publishing to use trusted publishing via OIDC

## 0.6.1

### Patch Changes

- fdfc623: More docs
- f3d5140: Update publish config

## 0.6.0

### Minor Changes

- 815c5ea: Support JSONSchema

## 0.5.0

### Minor Changes

- ad66ee5: Fix types for temporal-zod

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

## 0.1.0

### Minor Changes

- e38edef: Move base validators to temporal-zod/base
- cc7297a: Bump dependencies

## 0.0.5

### Patch Changes

- 8e557ba: Add tests

## 0.0.4

### Patch Changes

- c3b8a47: - Remove scope from superjson-temporal and zod-temporal
  - Add format-temporal

## 0.0.3

### Patch Changes

- 5c3298c: Export ZodTemporal type helper to allow dependents to generate types

## 0.0.2

### Patch Changes

- fd1874b: Add temporal-interval package, add some tests
