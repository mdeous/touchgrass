import { enUS, fr } from "date-fns/locale"
import type { Locale } from "date-fns"
import i18n from "./index"

const localeMap: Record<string, Locale> = {
  en: enUS,
  fr: fr,
}

export function getDateLocale(): Locale {
  return localeMap[i18n.language] ?? enUS
}
