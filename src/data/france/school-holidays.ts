import type { SchoolYear, SchoolZone, SchoolHolidayPeriod } from '@/engine/types'

// Source: official French school calendar, data.education.gouv.fr dataset
// "fr-en-calendrier-scolaire" (dates converted to Europe/Paris).
// `start` is the first day of holidays; `end` is the day classes resume
// (exclusive). The 2028 summer end is not published yet and is provisional.
const SCHOOL_YEARS: readonly SchoolYear[] = [
  {
    year: '2024-2025',
    zones: {
      A: [
        { name: 'Toussaint', start: '2024-10-19', end: '2024-11-04' },
        { name: 'Noël', start: '2024-12-21', end: '2025-01-06' },
        { name: "Hiver", start: '2025-02-22', end: '2025-03-10' },
        { name: 'Printemps', start: '2025-04-19', end: '2025-05-05' },
        { name: 'Été', start: '2025-07-05', end: '2025-09-01' },
      ],
      B: [
        { name: 'Toussaint', start: '2024-10-19', end: '2024-11-04' },
        { name: 'Noël', start: '2024-12-21', end: '2025-01-06' },
        { name: "Hiver", start: '2025-02-08', end: '2025-02-24' },
        { name: 'Printemps', start: '2025-04-05', end: '2025-04-22' },
        { name: 'Été', start: '2025-07-05', end: '2025-09-01' },
      ],
      C: [
        { name: 'Toussaint', start: '2024-10-19', end: '2024-11-04' },
        { name: 'Noël', start: '2024-12-21', end: '2025-01-06' },
        { name: "Hiver", start: '2025-02-15', end: '2025-03-03' },
        { name: 'Printemps', start: '2025-04-12', end: '2025-04-28' },
        { name: 'Été', start: '2025-07-05', end: '2025-09-01' },
      ],
    },
  },
  {
    year: '2025-2026',
    zones: {
      A: [
        { name: 'Toussaint', start: '2025-10-18', end: '2025-11-03' },
        { name: 'Noël', start: '2025-12-20', end: '2026-01-05' },
        { name: "Hiver", start: '2026-02-07', end: '2026-02-23' },
        { name: 'Printemps', start: '2026-04-04', end: '2026-04-20' },
        { name: 'Été', start: '2026-07-04', end: '2026-09-01' },
      ],
      B: [
        { name: 'Toussaint', start: '2025-10-18', end: '2025-11-03' },
        { name: 'Noël', start: '2025-12-20', end: '2026-01-05' },
        { name: "Hiver", start: '2026-02-14', end: '2026-03-02' },
        { name: 'Printemps', start: '2026-04-11', end: '2026-04-27' },
        { name: 'Été', start: '2026-07-04', end: '2026-09-01' },
      ],
      C: [
        { name: 'Toussaint', start: '2025-10-18', end: '2025-11-03' },
        { name: 'Noël', start: '2025-12-20', end: '2026-01-05' },
        { name: "Hiver", start: '2026-02-21', end: '2026-03-09' },
        { name: 'Printemps', start: '2026-04-18', end: '2026-05-04' },
        { name: 'Été', start: '2026-07-04', end: '2026-09-01' },
      ],
    },
  },
  {
    year: '2026-2027',
    zones: {
      A: [
        { name: 'Toussaint', start: '2026-10-17', end: '2026-11-02' },
        { name: 'Noël', start: '2026-12-19', end: '2027-01-04' },
        { name: "Hiver", start: '2027-02-13', end: '2027-03-01' },
        { name: 'Printemps', start: '2027-04-10', end: '2027-04-26' },
        { name: 'Été', start: '2027-07-03', end: '2027-09-01' },
      ],
      B: [
        { name: 'Toussaint', start: '2026-10-17', end: '2026-11-02' },
        { name: 'Noël', start: '2026-12-19', end: '2027-01-04' },
        { name: "Hiver", start: '2027-02-20', end: '2027-03-08' },
        { name: 'Printemps', start: '2027-04-17', end: '2027-05-03' },
        { name: 'Été', start: '2027-07-03', end: '2027-09-01' },
      ],
      C: [
        { name: 'Toussaint', start: '2026-10-17', end: '2026-11-02' },
        { name: 'Noël', start: '2026-12-19', end: '2027-01-04' },
        { name: "Hiver", start: '2027-02-06', end: '2027-02-22' },
        { name: 'Printemps', start: '2027-04-03', end: '2027-04-19' },
        { name: 'Été', start: '2027-07-03', end: '2027-09-01' },
      ],
    },
  },
  {
    year: '2027-2028',
    zones: {
      A: [
        { name: 'Toussaint', start: '2027-10-23', end: '2027-11-08' },
        { name: 'Noël', start: '2027-12-18', end: '2028-01-03' },
        { name: "Hiver", start: '2028-02-19', end: '2028-03-06' },
        { name: 'Printemps', start: '2028-04-22', end: '2028-05-09' },
        { name: 'Été', start: '2028-07-04', end: '2028-09-01' },
      ],
      B: [
        { name: 'Toussaint', start: '2027-10-23', end: '2027-11-08' },
        { name: 'Noël', start: '2027-12-18', end: '2028-01-03' },
        { name: "Hiver", start: '2028-02-05', end: '2028-02-21' },
        { name: 'Printemps', start: '2028-04-08', end: '2028-04-24' },
        { name: 'Été', start: '2028-07-04', end: '2028-09-01' },
      ],
      C: [
        { name: 'Toussaint', start: '2027-10-23', end: '2027-11-08' },
        { name: 'Noël', start: '2027-12-18', end: '2028-01-03' },
        { name: "Hiver", start: '2028-02-12', end: '2028-02-28' },
        { name: 'Printemps', start: '2028-04-15', end: '2028-05-02' },
        { name: 'Été', start: '2028-07-04', end: '2028-09-01' },
      ],
    },
  },
]

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getSchoolHolidays(
  year: number,
  zone: SchoolZone,
): { name: string; start: Date; end: Date }[] {
  if (zone === 'none') return []

  const results: { name: string; start: Date; end: Date }[] = []

  for (const schoolYear of SCHOOL_YEARS) {
    const periods: readonly SchoolHolidayPeriod[] = schoolYear.zones[zone] ?? []
    for (const period of periods) {
      const start = parseDate(period.start)
      const end = parseDate(period.end)
      if (start.getFullYear() === year || end.getFullYear() === year) {
        results.push({ name: period.name, start, end })
      }
    }
  }

  return results
}

export { SCHOOL_YEARS }
