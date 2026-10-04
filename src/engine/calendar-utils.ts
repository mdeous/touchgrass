import { format, addDays } from "date-fns";
import type { AppConfig, DayInfo, DayType, Holiday } from "@/engine/types";
import { getSchoolHolidays } from "@/data/france/school-holidays";

function makeDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * Builds the day list for `config.year`. With `marginDays > 0`, the list also
 * covers that many days before Jan 1 and after Dec 31 (flagged `inYear: false`)
 * so breaks that cross the year boundary can be measured. Pass holidays for the
 * neighbouring years too when using a margin.
 */
export function buildCalendar(
  config: AppConfig,
  holidays: readonly Holiday[],
  marginDays = 0,
): DayInfo[] {
  const {
    year,
    weekendDays,
    schoolZone,
    blackoutDates,
    preBookedDates,
    preBookedTypes,
    customHolidays,
  } = config;

  const holidayMap = new Map<string, Holiday>();
  for (const h of holidays) {
    holidayMap.set(makeDateKey(h.date), h);
  }

  for (const customKey of customHolidays) {
    if (!holidayMap.has(customKey)) {
      const [y, m, d] = customKey.split("-").map(Number);
      holidayMap.set(customKey, {
        date: new Date(y, m - 1, d),
        name: "Custom Holiday",
        nameEn: "Custom Holiday",
      });
    }
  }

  const blackoutSet = new Set(blackoutDates);
  const preBookedSet = new Set(preBookedDates);

  const schoolHolidayPeriods = [
    ...(marginDays > 0 ? getSchoolHolidays(year - 1, schoolZone) : []),
    ...getSchoolHolidays(year, schoolZone),
    ...(marginDays > 0 ? getSchoolHolidays(year + 1, schoolZone) : []),
  ];

  const weekendSet = new Set(weekendDays);
  const daysCount = getDaysInYear(year) + 2 * marginDays;
  const days: DayInfo[] = [];
  let current = addDays(new Date(year, 0, 1), -marginDays);

  for (let i = 0; i < daysCount; i++) {
    const dateKey = makeDateKey(current);
    const dayOfWeek = current.getDay();
    const isWeekend = weekendSet.has(dayOfWeek);
    const holiday = holidayMap.get(dateKey) ?? null;

    let schoolHolidayName: string | null = null;
    for (const period of schoolHolidayPeriods) {
      // period.end is the day classes resume, so it is exclusive.
      if (current >= period.start && current < period.end) {
        schoolHolidayName = period.name;
        break;
      }
    }

    // Blackout and pre-booked only make sense on workdays: a weekend or
    // holiday stays off whatever the user marked on it.
    let type: DayType;
    if (holiday) {
      type = "holiday";
    } else if (isWeekend) {
      type = "weekend";
    } else if (blackoutSet.has(dateKey)) {
      type = "blackout";
    } else if (preBookedSet.has(dateKey)) {
      const leaveType = preBookedTypes[dateKey] ?? "pto";
      type = leaveType === "recovery" ? "prebooked-recovery" : "prebooked-pto";
    } else {
      type = "workday";
    }

    days.push({
      date: new Date(current.getTime()),
      dateKey,
      dayOfWeek,
      isWeekend,
      holiday,
      type,
      inYear: current.getFullYear() === year,
      isSchoolHoliday: schoolHolidayName !== null,
      schoolZoneName: schoolHolidayName,
    });

    current = addDays(current, 1);
  }

  return days;
}
