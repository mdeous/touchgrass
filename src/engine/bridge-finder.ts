import { format, addDays, differenceInCalendarDays } from "date-fns";
import type { Bridge, DayInfo, Holiday } from "@/engine/types";

const MAX_GAP_DAYS = 4;

function isOffDay(day: DayInfo): boolean {
  return (
    day.type === "weekend" ||
    day.type === "holiday" ||
    day.type === "prebooked-pto" ||
    day.type === "prebooked-recovery"
  );
}

function findClusterBounds(
  gap: DayInfo[],
  calendarMap: Map<string, DayInfo>,
): { start: Date; end: Date; days: DayInfo[] } {
  let clusterStart = gap[0].date;
  let prevDay = addDays(clusterStart, -1);
  let prevInfo = calendarMap.get(format(prevDay, "yyyy-MM-dd"));
  while (prevInfo && isOffDay(prevInfo)) {
    clusterStart = prevDay;
    prevDay = addDays(prevDay, -1);
    prevInfo = calendarMap.get(format(prevDay, "yyyy-MM-dd"));
  }

  let clusterEnd = gap[gap.length - 1].date;
  let nextDay = addDays(clusterEnd, 1);
  let nextInfo = calendarMap.get(format(nextDay, "yyyy-MM-dd"));
  while (nextInfo && isOffDay(nextInfo)) {
    clusterEnd = nextDay;
    nextDay = addDays(nextDay, 1);
    nextInfo = calendarMap.get(format(nextDay, "yyyy-MM-dd"));
  }

  const days: DayInfo[] = [];
  const length = differenceInCalendarDays(clusterEnd, clusterStart) + 1;
  for (let i = 0; i < length; i++) {
    const info = calendarMap.get(format(addDays(clusterStart, i), "yyyy-MM-dd"));
    if (info) days.push(info);
  }

  return { start: clusterStart, end: clusterEnd, days };
}

/** The holiday in the cluster closest to the gap names the bridge. */
function nearestHoliday(
  clusterDays: readonly DayInfo[],
  gap: readonly DayInfo[],
): Holiday | null {
  const gapStart = gap[0].date;
  const gapEnd = gap[gap.length - 1].date;
  let best: Holiday | null = null;
  let bestDistance = Infinity;
  for (const day of clusterDays) {
    if (!day.holiday) continue;
    const distance =
      day.date < gapStart
        ? differenceInCalendarDays(gapStart, day.date)
        : differenceInCalendarDays(day.date, gapEnd);
    if (distance < bestDistance) {
      best = day.holiday;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * Lists candidate bridges: runs of 1–4 workdays that would join a holiday to
 * the surrounding days off. Used to show and toggle bridges in the UI; the
 * optimizer itself works on the whole calendar.
 *
 * The calendar may include margin days from neighbouring years so bridges at
 * the year boundary are found; gaps must lie entirely within the year.
 * Bridge ids are stable: `bridge-<first gap day>`.
 */
export function findBridges(calendar: readonly DayInfo[], today?: Date): Bridge[] {
  const calendarMap = new Map<string, DayInfo>();
  for (const day of calendar) {
    calendarMap.set(day.dateKey, day);
  }

  const todayKey = format(today ?? new Date(), "yyyy-MM-dd");
  const bridges: Bridge[] = [];

  const flush = (gap: DayInfo[]) => {
    if (gap.length === 0 || gap.length > MAX_GAP_DAYS) return;
    if (gap.some((d) => !d.inYear || d.dateKey < todayKey)) return;

    const cluster = findClusterBounds(gap, calendarMap);
    const holidays = cluster.days.flatMap((d) => (d.holiday ? [d.holiday] : []));
    if (holidays.length === 0) return;

    const named = nearestHoliday(cluster.days, gap);
    const ptoCost = gap.length;
    const totalDaysOff = cluster.days.length;

    bridges.push({
      id: `bridge-${gap[0].dateKey}`,
      days: gap.map((d) => new Date(d.date.getTime())),
      ptoCost,
      totalDaysOff,
      gainedDays: totalDaysOff - ptoCost,
      efficiency: totalDaysOff / ptoCost,
      adjacentHolidays: holidays.map((h) => h.nameEn),
      pontName: named?.nameEn ?? null,
      pontNameLocal: named?.name ?? null,
      startDate: cluster.start,
      endDate: cluster.end,
      weightedScore: 0,
    });
  };

  let gapDays: DayInfo[] = [];
  for (const day of calendar) {
    if (day.type === "workday") {
      gapDays.push(day);
    } else {
      flush(gapDays);
      gapDays = [];
    }
  }
  // The calendar can end on a workday; don't drop that last gap.
  flush(gapDays);

  return bridges;
}
