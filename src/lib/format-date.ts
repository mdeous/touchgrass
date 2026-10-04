import { format } from "date-fns";
import type { Locale } from "date-fns";

// Capitalize the first letter of each word. `\b` is ASCII-only in JS and
// would treat accented letters as word boundaries ("févr." -> "FÉVr.").
const capitalize = (s: string) =>
  s.replace(/(^|\s)(\p{L})/gu, (_, space: string, c: string) =>
    space + c.toUpperCase(),
  );

export function formatShortDate(
  date: Date,
  locale: Locale,
  lang: string,
): string {
  const fmt = lang === "fr" ? "d MMM" : "MMM d";
  return capitalize(format(date, fmt, { locale }));
}

export function formatFullDate(
  date: Date,
  locale: Locale,
  lang: string,
): string {
  const fmt = lang === "fr" ? "d MMM yyyy" : "MMM d, yyyy";
  return capitalize(format(date, fmt, { locale }));
}
