/**
 * Shared building blocks for the exported `*_PATTERN` regexes.
 *
 * Each Temporal type publishes a `pattern` in its JSON Schema metadata, which
 * becomes the advertised contract once that schema reaches an OpenAPI document.
 * The contract has to accept everything `toJSON()` can emit, which is wider than
 * the common case:
 *
 * - Under a non-ISO calendar, `toJSON()` appends a `[u-ca=…]` annotation.
 * - Under a non-ISO calendar, `PlainYearMonth` and `PlainMonthDay` serialize as
 *   a **full reference date** rather than `YYYY-MM` / `MM-DD`.
 * - Years outside 0000–9999 use the six-digit signed form (e.g. `-000753`).
 *
 * These parts are deliberately internal — they are composed into the exported
 * patterns rather than exported themselves, so the public surface stays the
 * eight `*_PATTERN` strings.
 *
 * @module
 */

/** Four-digit year, or the signed six-digit form for years outside 0000–9999. */
export const YEAR_PART = "([+-]\\d{6}|\\d{4})";

/** Month, `01`–`12`. */
export const MONTH_PART = "(0[1-9]|1[0-2])";

/** Day of month, `01`–`31`. */
export const DAY_PART = "(0[1-9]|[12]\\d|3[01])";

/** Wall-clock time with optional seconds and up to nanosecond precision. */
export const TIME_PART = "([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d(\\.\\d{1,9})?)?";

/** UTC designator or a `±HH:MM` offset. */
export const OFFSET_PART = "(Z|[+-]([01]\\d|2[0-3]):[0-5]\\d)";

/**
 * Bracketed time zone annotation, e.g. `[Asia/Manila]`, `[UTC]`, `[+08:00]`.
 *
 * The leading `!` marks a critical annotation. The character class excludes `[`
 * and `]` so this cannot swallow a following `[u-ca=…]` group — the reason the
 * previous `\[.+\]` accepted malformed input like `[not a time zone!][]`.
 */
export const TIME_ZONE_PART = "\\[!?[A-Za-z0-9_+.:/-]+\\]";

/** Calendar annotation, e.g. `[u-ca=hebrew]`, `[u-ca=islamic-umalqura]`. */
export const CALENDAR_PART = "\\[u-ca=[A-Za-z0-9]+(-[A-Za-z0-9]+)*\\]";

/** {@link CALENDAR_PART}, optional. */
export const OPTIONAL_CALENDAR_PART: string = `(${CALENDAR_PART})?`;

/** Calendar date, `YYYY-MM-DD`. */
export const DATE_PART: string = `${YEAR_PART}-${MONTH_PART}-${DAY_PART}`;
