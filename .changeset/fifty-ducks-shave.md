---
"format-temporal": patch
---

Fix `formatTemporal` dropping the month name for ISO-calendar `PlainYearMonth` and `PlainMonthDay` values (`2023-05` rendered as `"2023 "`). ISO values are now formatted in the calendar the formatter resolved to; non-ISO values keep their own calendar.
