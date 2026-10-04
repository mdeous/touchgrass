import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Holidays from 'date-holidays'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.resolve(__dirname, '../src/data/generated/holidays')
const INDEX_PATH = path.resolve(__dirname, '../src/data/generated/country-index.json')

const COUNTRIES = [
  'FR', 'US', 'GB', 'DE', 'ES', 'IT', 'PT', 'NL', 'BE', 'LU',
  'CH', 'AT', 'IE', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'GR',
  'JP', 'CA', 'AU', 'NZ', 'BR', 'MX', 'IN', 'SA', 'AE', 'SG',
] as const

const YEARS = [2024, 2025, 2026, 2027, 2028, 2029] as const
// Statutory public holidays only. date-holidays' "bank" type covers bank
// closures and customary days that are not legal days off, e.g. MX Good
// Friday (not in Ley Federal del Trabajo art. 74), IE Good Friday and
// weekend substitutes (WRC: "no legal entitlement to have the next working
// day off"), NL/FI Dec 31, JP Jan 2-3, BR Carnival.
const ALLOWED_TYPES = new Set(['public'])

// Countries whose country-level data is incomplete, mapped to the
// subdivision used when no region is picked. GB: date-holidays defines the
// Summer bank holiday only per nation, so the country level misses it; use
// England (England & Wales, ~89% of the UK population per ONS mid-2024).
const DEFAULT_SUBDIVISION: Readonly<Record<string, { code: string; label: string }>> = {
  GB: { code: 'ENG', label: 'United Kingdom (England & Wales)' },
}

interface HolidayEntry {
  readonly date: string
  readonly name: string
  readonly type: string
}

interface CountryData {
  readonly subdivisions: Record<string, string>
  readonly holidays: Record<string, Record<string, readonly HolidayEntry[]>>
}

// Corrections to date-holidays rules, applied after every init.
// AE: official list per Cabinet Resolution No. 27 of 2024
// (https://u.ae/en/information-and-services/public-holidays-and-religious-affairs/public-holidays).
// Isra and Mi'raj and the first day of Ramadan stopped being holidays in
// 2019; Arafat Day and the second National Day were missing; Eid al-Fitr
// includes 30 Ramadan when Ramadan has 30 days, which is only known from
// the moon sighting, so that day is added per announced year below.
const RULE_OVERRIDES: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {
  AE: {
    '27 Rajab': false,
    '1 Ramadan': false,
    '12-02': false,
    '12-02 P2D': { name: { en: 'National Day' }, type: 'public' },
    '9 Dhu al-Hijjah': { name: { en: 'Arafat Day' }, type: 'public' },
  },
}

// Holidays moved by official announcement, as [calculated date, observed date].
// Only announced moves are listed; other years keep the calculated dates.
const MOVED_HOLIDAYS: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  AE: [
    // Hijri New Year 2025: https://www.khaleejtimes.com/uae/private-sector-holiday-hijri-new-year-1447-ah
    ['2025-06-26', '2025-06-27'],
    // National Day 2025: https://gulfnews.com/uae/uae-national-day-holidays-announced-2-1.500348949
    ['2025-12-03', '2025-12-01'],
    // Hijri New Year 2026: https://en.aletihad.ae/news/uae/4670030/uae-announces-hijri-new-year-holiday-on-june-15
    ['2026-06-16', '2026-06-15'],
    // Prophet's Birthday 2026: https://www.khaleejtimes.com/world/gulf/prophet-brithday-2026-public-holidays-gulf-countries
    ['2026-08-25', '2026-08-28'],
  ],
}

// Announced holidays the rules can't produce, as [date, name].
const EXTRA_HOLIDAYS: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  AE: [
    // 30 Ramadan 2026 (Ramadan had 30 days, Eid on Mar 20):
    // https://gulfnews.com/uae/uae-announces-eid-al-fitr-2026-holiday-for-private-sector-1.500452323
    ['2026-03-19', 'End of Ramadan (Eid al-Fitr)'],
  ],
}

function applyRuleOverrides(hd: Holidays, countryCode: string): void {
  for (const [rule, value] of Object.entries(RULE_OVERRIDES[countryCode] ?? {})) {
    // setHoliday(rule, false) removes a rule; an object adds or replaces it.
    hd.setHoliday(rule, value as Parameters<Holidays['setHoliday']>[1])
  }
}

function applyAnnouncements(
  countryCode: string,
  year: number,
  entries: readonly HolidayEntry[],
): HolidayEntry[] {
  const moves = new Map(MOVED_HOLIDAYS[countryCode] ?? [])
  const moved = entries.map((h) => ({ ...h, date: moves.get(h.date) ?? h.date }))
  const dates = new Set(moved.map((h) => h.date))
  for (const [date, name] of EXTRA_HOLIDAYS[countryCode] ?? []) {
    if (date.startsWith(`${year}-`) && !dates.has(date)) {
      moved.push({ date, name, type: 'public' })
    }
  }
  return moved.sort((a, b) => a.date.localeCompare(b.date))
}

const DAY_MS = 86_400_000

function formatDate(dateStr: string): string {
  return dateStr.slice(0, 10)
}

function addDaysToKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

function getHolidaysForInit(hd: Holidays, year: number, countryCode: string): readonly HolidayEntry[] {
  const entries: HolidayEntry[] = []
  const seen = new Set<string>()
  for (const h of hd.getHolidays(year, 'en')) {
    if (!ALLOWED_TYPES.has(h.type)) continue
    // Partial days (e.g. DE Christmas Eve from 14:00) are not days off.
    const days = Math.round((h.end.getTime() - h.start.getTime()) / DAY_MS)
    if (days < 1) continue
    // Multi-day holidays (e.g. Eid in SA/AE) cover every day of the range.
    const first = formatDate(h.date)
    for (let i = 0; i < days; i++) {
      const date = addDaysToKey(first, i)
      if (seen.has(date)) continue
      seen.add(date)
      entries.push({ date, name: h.name, type: h.type })
    }
  }
  return applyAnnouncements(countryCode, year, entries)
}

function generateCountry(countryCode: string): { readonly data: CountryData; readonly subdivisionKeys: readonly string[] } {
  const hd = new Holidays()

  const countries = hd.getCountries('en')
  const countryName = countries[countryCode] ?? countryCode

  const subdivisions: Record<string, string> = { default: countryName }
  const holidays: Record<string, Record<string, readonly HolidayEntry[]>> = {}

  hd.init(countryCode, { languages: ['en'] })
  applyRuleOverrides(hd, countryCode)
  const defaultYears: Record<string, readonly HolidayEntry[]> = {}
  for (const year of YEARS) {
    defaultYears[String(year)] = getHolidaysForInit(hd, year, countryCode)
  }
  holidays['default'] = defaultYears

  const states = hd.getStates(countryCode, 'en')
  if (states) {
    for (const [stateCode, stateName] of Object.entries(states)) {
      subdivisions[stateCode] = stateName

      hd.init(countryCode, stateCode, { languages: ['en'] })
      applyRuleOverrides(hd, countryCode)
      const stateYears: Record<string, readonly HolidayEntry[]> = {}
      for (const year of YEARS) {
        stateYears[String(year)] = getHolidaysForInit(hd, year, countryCode)
      }
      holidays[stateCode] = stateYears
    }
  }

  const fallback = DEFAULT_SUBDIVISION[countryCode]
  if (fallback && holidays[fallback.code]) {
    holidays['default'] = holidays[fallback.code]
    subdivisions['default'] = fallback.label
  }

  const subdivisionKeys = Object.keys(subdivisions)

  return {
    data: { subdivisions, holidays },
    subdivisionKeys,
  }
}

function main(): void {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const countryIndex: Record<string, readonly string[]> = {}

  console.log(`Generating holidays for ${COUNTRIES.length} countries, years ${YEARS[0]}-${YEARS[YEARS.length - 1]}`)
  console.log(`Output: ${OUTPUT_DIR}`)
  console.log()

  for (const countryCode of COUNTRIES) {
    const startTime = Date.now()
    const { data, subdivisionKeys } = generateCountry(countryCode)
    countryIndex[countryCode] = subdivisionKeys

    const outputPath = path.join(OUTPUT_DIR, `${countryCode}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))

    const elapsed = Date.now() - startTime
    const stateCount = subdivisionKeys.length - 1
    const stateLabel = stateCount > 0 ? ` (${stateCount} subdivisions)` : ''
    console.log(`  ${countryCode}: ${data.subdivisions['default']}${stateLabel} — ${elapsed}ms`)
  }

  fs.writeFileSync(INDEX_PATH, JSON.stringify(countryIndex, null, 2))
  console.log()
  console.log(`Country index written to ${INDEX_PATH}`)
  console.log('Done.')
}

main()
