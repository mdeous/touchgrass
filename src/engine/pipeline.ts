import { format } from "date-fns";
import { buildCalendar } from "@/engine/calendar-utils";
import { findBridges } from "@/engine/bridge-finder";
import { optimize } from "@/engine/optimizer";
import { allocate } from "@/engine/allocator";
import type {
  Allocation,
  AppConfig,
  Bridge,
  DayInfo,
  Holiday,
  LeaveType,
  OptimizationResult,
} from "@/engine/types";

/** Days borrowed from each neighbouring year so year-end breaks are measured. */
export const MARGIN_DAYS = 14;

export interface PipelineOutput {
  /** Days of the selected year, with chosen and manual leave applied. */
  readonly calendar: readonly DayInfo[];
  readonly result: OptimizationResult;
  /** Candidate bridges for the UI list, in date order. */
  readonly candidates: readonly Bridge[];
}

/**
 * Runs the whole optimization. `holidays` should cover the year before and
 * after `config.year` too, for the margin days.
 */
export function runPipeline(
  config: AppConfig,
  holidays: readonly Holiday[],
  today: Date = new Date(),
): PipelineOutput {
  const fullCalendar = buildCalendar(config, holidays, MARGIN_DAYS);
  const dayByKey = new Map(fullCalendar.map((d) => [d.dateKey, d]));
  const todayKey = format(today, "yyyy-MM-dd");

  const candidates = findBridges(fullCalendar, today);

  const blocked = new Set<string>();
  for (const day of fullCalendar) {
    if (day.dateKey < todayKey) blocked.add(day.dateKey);
  }
  const disabledIds = new Set(config.disabledBridges);
  for (const candidate of candidates) {
    if (!disabledIds.has(candidate.id)) continue;
    for (const date of candidate.days) blocked.add(format(date, "yyyy-MM-dd"));
  }

  const forcedLeave = new Map<string, LeaveType>();
  for (const [key, value] of Object.entries(config.manualOverrides)) {
    const day = dayByKey.get(key);
    if (!day || !day.inYear || day.type !== "workday") continue;
    if (value === null) blocked.add(key);
    else forcedLeave.set(key, value);
  }

  const fixedAllocations: Allocation[] = [];
  for (const day of fullCalendar) {
    if (!day.inYear) continue;
    const leaveType =
      day.type === "prebooked-pto"
        ? "pto"
        : day.type === "prebooked-recovery"
          ? "recovery"
          : forcedLeave.get(day.dateKey);
    if (leaveType) fixedAllocations.push({ date: day.date, leaveType });
  }

  const fixedPto = fixedAllocations.filter((a) => a.leaveType === "pto").length;
  const fixedRecovery = fixedAllocations.length - fixedPto;
  const ptoAvailable = Math.max(0, Math.floor(config.ptoBudget) - fixedPto);
  const recoveryAvailable = Math.max(
    0,
    Math.floor(config.recoveryBudget) - fixedRecovery,
  );

  const selectedBridges = optimize({
    calendar: fullCalendar,
    budget: ptoAvailable + recoveryAvailable,
    strategy: config.strategy,
    blocked,
    forcedLeave: new Set(forcedLeave.keys()),
  });

  const allocations = [
    ...fixedAllocations,
    ...allocate(selectedBridges, ptoAvailable, recoveryAvailable),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const ptoUsed = allocations.filter((a) => a.leaveType === "pto").length;
  const recoveryUsed = allocations.length - ptoUsed;

  const totalDaysOff = selectedBridges.reduce((s, b) => s + b.totalDaysOff, 0);
  const totalLeave = selectedBridges.reduce((s, b) => s + b.ptoCost, 0);

  const result: OptimizationResult = {
    selectedBridges,
    allocations,
    ptoUsed,
    recoveryUsed,
    totalDaysOff,
    averageEfficiency: totalLeave > 0 ? totalDaysOff / totalLeave : 0,
  };

  const leaveByKey = new Map<string, LeaveType>();
  for (const a of allocations) {
    leaveByKey.set(format(a.date, "yyyy-MM-dd"), a.leaveType);
  }
  const calendar = fullCalendar
    .filter((d) => d.inYear)
    .map((day) => {
      const leaveType = leaveByKey.get(day.dateKey);
      return leaveType && day.type === "workday"
        ? { ...day, type: leaveType }
        : day;
    });

  return { calendar, result, candidates };
}
