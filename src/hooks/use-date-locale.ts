import { useTranslation } from "react-i18next"
import { enUS, fr } from "date-fns/locale"
import type { Locale } from "date-fns"

const localeMap: Record<string, Locale> = {
  en: enUS,
  fr: fr,
}

export function useDateLocale(): Locale {
  const { i18n } = useTranslation()
  return localeMap[i18n.language] ?? enUS
}
