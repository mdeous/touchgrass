import { format, addDays, isWithinInterval } from 'date-fns'
import type { AppConfig, DayInfo, DayType, Holiday } from '@/engine/types'
import { getHolidaysForYear } from '@/data/holidays'
import { getSchoolHolidays } from '@/data/school-holidays'

function makeDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365
}

export function buildCalendar(config: AppConfig): DayInfo[] {
  const { year, region, schoolZone, blackoutDates, preBookedDates, preBookedTypes, customHolidays } = config

  const holidays = getHolidaysForYear(year, region)
  const holidayMap = new Map<string, Holiday>()
  for (const h of holidays) {
    holidayMap.set(makeDateKey(h.date), h)
  }

  for (const customKey of customHolidays) {
    if (!holidayMap.has(customKey)) {
      const [y, m, d] = customKey.split('-').map(Number)
      holidayMap.set(customKey, {
        date: new Date(y, m - 1, d),
        name: 'Jour férié personnalisé',
        nameEn: 'Custom Holiday',
      })
    }
  }

  const blackoutSet = new Set(blackoutDates)
  const preBookedSet = new Set(preBookedDates)

  const schoolHolidayPeriods = getSchoolHolidays(year, schoolZone)

  const daysCount = getDaysInYear(year)
  const days: DayInfo[] = []
  let current = new Date(year, 0, 1)

  for (let i = 0; i < daysCount; i++) {
    const dateKey = makeDateKey(current)
    const dayOfWeek = current.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const holiday = holidayMap.get(dateKey) ?? null

    let schoolHolidayName: string | null = null
    for (const period of schoolHolidayPeriods) {
      if (isWithinInterval(current, { start: period.start, end: period.end })) {
        schoolHolidayName = period.name
        break
      }
    }

    let type: DayType
    if (blackoutSet.has(dateKey)) {
      type = 'blackout'
    } else if (preBookedSet.has(dateKey)) {
      const leaveType = preBookedTypes[dateKey] ?? 'pto'
      type = leaveType === 'recovery' ? 'prebooked-recovery' : 'prebooked-pto'
    } else if (holiday) {
      type = 'holiday'
    } else if (isWeekend) {
      type = 'weekend'
    } else {
      type = 'workday'
    }

    days.push({
      date: new Date(current.getTime()),
      dateKey,
      dayOfWeek,
      isWeekend,
      holiday,
      type,
      isSchoolHoliday: schoolHolidayName !== null,
      schoolZoneName: schoolHolidayName,
    })

    current = addDays(current, 1)
  }

  return days
}
