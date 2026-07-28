// Bun has no native Temporal, so without this the ponyfill falls back to
// temporal-polyfill's default entry, which omits non-ISO calendar data.
// Install the full-ICU build globally so tests can exercise calendar
// annotations end to end; runtimes with native Temporal get this for free.
import "temporal-polyfill/full/global";
