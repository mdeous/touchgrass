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
const ALLOWED_TYPES = new Set(['public', 'bank'])

interface HolidayEntry {
  readonly date: string
  readonly name: string
  readonly type: string
}

interface CountryData {
  readonly subdivisions: Record<string, string>
  readonly holidays: Record<string, Record<string, readonly HolidayEntry[]>>
}

const DAY_MS = 86_400_000

function formatDate(dateStr: string): string {
  return dateStr.slice(0, 10)
}

function addDaysToKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

function getHolidaysForInit(hd: Holidays, year: number): readonly HolidayEntry[] {
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
  return entries
}

function generateCountry(countryCode: string): { readonly data: CountryData; readonly subdivisionKeys: readonly string[] } {
  const hd = new Holidays()

  const countries = hd.getCountries('en')
  const countryName = countries[countryCode] ?? countryCode

  const subdivisions: Record<string, string> = { default: countryName }
  const holidays: Record<string, Record<string, readonly HolidayEntry[]>> = {}

  hd.init(countryCode, { languages: ['en'] })
  const defaultYears: Record<string, readonly HolidayEntry[]> = {}
  for (const year of YEARS) {
    defaultYears[String(year)] = getHolidaysForInit(hd, year)
  }
  holidays['default'] = defaultYears

  const states = hd.getStates(countryCode, 'en')
  if (states) {
    for (const [stateCode, stateName] of Object.entries(states)) {
      subdivisions[stateCode] = stateName

      hd.init(countryCode, stateCode, { languages: ['en'] })
      const stateYears: Record<string, readonly HolidayEntry[]> = {}
      for (const year of YEARS) {
        stateYears[String(year)] = getHolidaysForInit(hd, year)
      }
      holidays[stateCode] = stateYears
    }
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
