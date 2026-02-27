import { format, addDays, differenceInCalendarDays } from "date-fns";
import type { Bridge, DayInfo } from "@/engine/types";

function isOffDay(day: DayInfo): boolean {
  return (
    day.type === "weekend" ||
    day.type === "holiday" ||
    day.type === "prebooked-cp" ||
    day.type === "prebooked-rtt"
  );
}

function findAdjacentHolidays(
  gap: DayInfo[],
  calendarMap: Map<string, DayInfo>,
): string[] {
  const holidays: string[] = [];

  if (gap.length === 0) return holidays;

  const firstGapDate = gap[0].date;
  const lastGapDate = gap[gap.length - 1].date;

  let checkBefore = addDays(firstGapDate, -1);
  for (let i = 0; i < 10; i++) {
    const key = format(checkBefore, "yyyy-MM-dd");
    const day = calendarMap.get(key);
    if (!day || (!day.isWeekend && day.type !== "holiday")) break;
    if (day.holiday) {
      holidays.push(day.holiday.name);
    }
    checkBefore = addDays(checkBefore, -1);
  }

  let checkAfter = addDays(lastGapDate, 1);
  for (let i = 0; i < 10; i++) {
    const key = format(checkAfter, "yyyy-MM-dd");
    const day = calendarMap.get(key);
    if (!day || (!day.isWeekend && day.type !== "holiday")) break;
    if (day.holiday) {
      holidays.push(day.holiday.name);
    }
    checkAfter = addDays(checkAfter, 1);
  }

  return holidays;
}

function findClusterBounds(
  gap: DayInfo[],
  calendarMap: Map<string, DayInfo>,
): {
  start: Date;
  end: Date;
  totalDaysOff: number;
  weekendsAndHolidays: number;
} {
  const firstGapDate = gap[0].date;
  const lastGapDate = gap[gap.length - 1].date;

  let clusterStart = firstGapDate;
  let prevDay = addDays(clusterStart, -1);
  let prevInfo = calendarMap.get(format(prevDay, "yyyy-MM-dd"));
  while (prevInfo && isOffDay(prevInfo)) {
    clusterStart = prevDay;
    prevDay = addDays(prevDay, -1);
    prevInfo = calendarMap.get(format(prevDay, "yyyy-MM-dd"));
  }

  let clusterEnd = lastGapDate;
  let nextDay = addDays(clusterEnd, 1);
  let nextInfo = calendarMap.get(format(nextDay, "yyyy-MM-dd"));
  while (nextInfo && isOffDay(nextInfo)) {
    clusterEnd = nextDay;
    nextDay = addDays(nextDay, 1);
    nextInfo = calendarMap.get(format(nextDay, "yyyy-MM-dd"));
  }

  const totalDaysOff = differenceInCalendarDays(clusterEnd, clusterStart) + 1;
  let weekendsAndHolidays = 0;
  let current = clusterStart;
  for (let i = 0; i < totalDaysOff; i++) {
    const key = format(current, "yyyy-MM-dd");
    const info = calendarMap.get(key);
    if (info && isOffDay(info)) {
      weekendsAndHolidays++;
    }
    current = addDays(current, 1);
  }

  return {
    start: clusterStart,
    end: clusterEnd,
    totalDaysOff,
    weekendsAndHolidays,
  };
}

function buildPontName(adjacentHolidays: string[]): string | null {
  if (adjacentHolidays.length === 0) return null;
  const name = adjacentHolidays[adjacentHolidays.length - 1];
  return `Pont ${getArticle(name)}${name}`;
}

function getArticle(holidayName: string): string {
  const vowelStart = /^[AEIOUÉÈÊaeiouéèê]/;
  if (
    holidayName.startsWith("l'") ||
    holidayName.startsWith("la ") ||
    holidayName.startsWith("le ")
  ) {
    return `de ${holidayName.startsWith("l'") ? "" : "la "}`;
  }
  if (vowelStart.test(holidayName)) return "de l'";
  return "du ";
}

export function findBridges(calendar: DayInfo[]): Bridge[] {
  const calendarMap = new Map<string, DayInfo>();
  for (const day of calendar) {
    calendarMap.set(day.dateKey, day);
  }

  const bridges: Bridge[] = [];
  let gapDays: DayInfo[] = [];
  let bridgeIndex = 0;

  for (const day of calendar) {
    if (day.type === "workday") {
      gapDays.push(day);
    } else {
      if (gapDays.length > 0 && gapDays.length <= 4) {
        const beforeGap = calendarMap.get(
          format(addDays(gapDays[0].date, -1), "yyyy-MM-dd"),
        );
        const afterGap = calendarMap.get(
          format(addDays(gapDays[gapDays.length - 1].date, 1), "yyyy-MM-dd"),
        );

        const hasBefore = beforeGap && isOffDay(beforeGap);
        const hasAfter = afterGap && isOffDay(afterGap);

        if (hasBefore || hasAfter) {
          const adjacentHolidays = findAdjacentHolidays(gapDays, calendarMap);
          const cluster = findClusterBounds(gapDays, calendarMap);
          const ptoCost = gapDays.length;
          const gainedDays = cluster.totalDaysOff - cluster.weekendsAndHolidays;
          const efficiency = ptoCost > 0 ? gainedDays / ptoCost : 0;

          bridges.push({
            id: `bridge-${bridgeIndex++}`,
            days: gapDays.map((d) => new Date(d.date.getTime())),
            ptoCost,
            totalDaysOff: cluster.totalDaysOff,
            gainedDays,
            efficiency,
            adjacentHolidays,
            pontName: buildPontName(adjacentHolidays),
            startDate: cluster.start,
            endDate: cluster.end,
            weightedScore: 0,
          });
        }
      }
      gapDays = [];
    }
  }

  return bridges;
}
