import type { Bridge, DayInfo, Strategy } from "@/engine/types";
import { breakValue, leaveDayCost } from "@/engine/scorer";

export const DEFAULT_MIN_EFFICIENCY = 2;

export interface OptimizeInput {
  /** Calendar including margin days; day types already reflect pre-booked/blackout. */
  readonly calendar: readonly DayInfo[];
  /** Leave days the optimizer may place. */
  readonly budget: number;
  readonly strategy: Strategy;
  /** Workdays that must not become leave (past days, forced workdays, disabled bridges). */
  readonly blocked: ReadonlySet<string>;
  /** Workdays the user already set as leave by hand; they count as off. */
  readonly forcedLeave: ReadonlySet<string>;
  /** Minimum days off per leave day for any break the optimizer creates. */
  readonly minEfficiency?: number;
}

function isFixedLeave(day: DayInfo, forcedLeave: ReadonlySet<string>): boolean {
  return (
    day.type === "prebooked-pto" ||
    day.type === "prebooked-recovery" ||
    forcedLeave.has(day.dateKey)
  );
}

function isAlreadyOff(day: DayInfo, forcedLeave: ReadonlySet<string>): boolean {
  return (
    day.type === "weekend" ||
    day.type === "holiday" ||
    isFixedLeave(day, forcedLeave)
  );
}

interface Step {
  readonly prev: number;
  /** Off run [runStart, runEnd) taken by this step, or -1 when the step only works a day. */
  readonly runStart: number;
  readonly runEnd: number;
}

/**
 * Picks the leave days that maximise the total value of the breaks.
 *
 * Exact dynamic programme over the days: state (i, b) means day i-1 is worked
 * and b leave days are spent. From there, either day i is worked, or a run of
 * off days [i, m) is taken where every eligible workday inside becomes leave
 * and day m is worked. A run with new leave adds `breakValue` (the weekend
 * and holiday days it captures, weighted by length for the strategy) and
 * each leave day costs `leaveDayCost`, so leave is only spent where it pays.
 * A run that contains new leave must include a holiday and give at least
 * `minEfficiency` days off per leave day, so the optimizer only builds real
 * bridges.
 *
 * Returns one Bridge per break that contains new leave. Breaks never overlap.
 */
export function optimize(input: OptimizeInput): Bridge[] {
  const { calendar, strategy, blocked, forcedLeave } = input;
  const minEfficiency = input.minEfficiency ?? DEFAULT_MIN_EFFICIENCY;
  const n = calendar.length;
  const leaveCost = leaveDayCost(strategy);

  const alreadyOff = calendar.map((d) => isAlreadyOff(d, forcedLeave));
  const fixedLeave = calendar.map((d) => isFixedLeave(d, forcedLeave));
  const eligible = calendar.map(
    (d) =>
      d.type === "workday" &&
      d.inYear &&
      !blocked.has(d.dateKey) &&
      !forcedLeave.has(d.dateKey),
  );

  // More budget than eligible days can't be spent; capping it also bounds
  // the DP table when the budget comes from an untrusted URL.
  const eligibleCount = eligible.filter(Boolean).length;
  const requested = Number.isFinite(input.budget) ? Math.floor(input.budget) : 0;
  const budget = Math.min(Math.max(0, requested), eligibleCount);
  const width = budget + 1;

  const best = new Float64Array((n + 1) * width).fill(-Infinity);
  const steps: (Step | undefined)[] = new Array((n + 1) * width);
  best[0] = 0;

  let finalValue = -Infinity;
  let finalState = -1;
  let finalRun: Step | undefined;

  const relax = (state: number, value: number, step: Step) => {
    if (value > best[state]) {
      best[state] = value;
      steps[state] = step;
    }
  };

  for (let i = 0; i < n; i++) {
    for (let b = 0; b <= budget; b++) {
      const from = i * width + b;
      const base = best[from];
      if (base === -Infinity) continue;

      // Work day i.
      if (!alreadyOff[i]) {
        relax((i + 1) * width + b, base, { prev: from, runStart: -1, runEnd: -1 });
      }

      // Take an off run starting at day i.
      let leave = 0;
      let fixed = 0;
      let hasHoliday = false;
      for (let m = i + 1; m <= n; m++) {
        const day = m - 1;
        if (!alreadyOff[day] && !eligible[day]) break;
        if (eligible[day]) leave++;
        if (b + leave > budget) break;
        if (fixedLeave[day]) fixed++;
        if (calendar[day].type === "holiday") hasHoliday = true;

        // The run must end before a day that is worked.
        if (m < n && alreadyOff[m]) continue;

        const length = m - i;
        if (
          leave > 0 &&
          (!hasHoliday || length / (leave + fixed) < minEfficiency)
        ) {
          continue;
        }

        // Runs without new leave score nothing: their days are off anyway.
        const value =
          leave === 0
            ? base
            : base +
              breakValue(length, length - leave - fixed, strategy) -
              leaveCost * leave;
        const step = { prev: from, runStart: i, runEnd: m };
        if (m === n) {
          if (value > finalValue) {
            finalValue = value;
            finalState = -1;
            finalRun = step;
          }
        } else {
          // Day m is worked, so the next state starts after it.
          relax((m + 1) * width + b + leave, value, step);
        }
      }
    }
  }

  for (let b = 0; b <= budget; b++) {
    const state = n * width + b;
    if (best[state] > finalValue) {
      finalValue = best[state];
      finalState = state;
      finalRun = undefined;
    }
  }

  const runs: { start: number; end: number }[] = [];
  let step = finalRun ?? (finalState >= 0 ? steps[finalState] : undefined);
  while (step) {
    if (step.runStart >= 0) runs.push({ start: step.runStart, end: step.runEnd });
    step = step.prev > 0 ? steps[step.prev] : undefined;
  }
  runs.reverse();

  const breaks: Bridge[] = [];
  for (const run of runs) {
    const days = calendar.slice(run.start, run.end);
    const leaveDays = days.filter((_, k) => eligible[run.start + k]);
    if (leaveDays.length === 0) continue;
    breaks.push(toBreak(days, leaveDays, strategy));
  }
  return breaks;
}

function toBreak(
  days: readonly DayInfo[],
  leaveDays: readonly DayInfo[],
  strategy: Strategy,
): Bridge {
  const holidays = days.flatMap((d) => (d.holiday ? [d.holiday] : []));
  const totalDaysOff = days.length;
  const ptoCost = leaveDays.length;
  return {
    id: `break-${leaveDays[0].dateKey}`,
    days: leaveDays.map((d) => new Date(d.date.getTime())),
    ptoCost,
    totalDaysOff,
    gainedDays: totalDaysOff - ptoCost,
    efficiency: totalDaysOff / ptoCost,
    adjacentHolidays: holidays.map((h) => h.nameEn),
    pontName: holidays[0]?.nameEn ?? null,
    pontNameLocal: holidays[0]?.name ?? null,
    startDate: days[0].date,
    endDate: days[days.length - 1].date,
    weightedScore: breakValue(totalDaysOff, totalDaysOff - ptoCost, strategy),
  };
}
