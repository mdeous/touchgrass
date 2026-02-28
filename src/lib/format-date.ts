import { format } from "date-fns";
import type { Locale } from "date-fns";

const capitalize = (s: string) =>
  s.replace(/\b[a-zA-Z\u00C0-\u00FF]/g, (c) => c.toUpperCase());

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
