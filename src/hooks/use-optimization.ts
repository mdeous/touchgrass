import { useMemo, useState, useEffect } from "react";
import { buildCalendar } from "@/engine/calendar-utils";
import { findBridges } from "@/engine/bridge-finder";
import { scoreBridges } from "@/engine/scorer";
import { optimize } from "@/engine/optimizer";
import { allocate } from "@/engine/allocator";
import { loadHolidays } from "@/data/holiday-loader";
import type {
  AppConfig,
  Bridge,
  DayInfo,
  Holiday,
  LeaveType,
  OptimizationResult,
} from "@/engine/types";
import { format } from "date-fns";

interface OptimizationOutput {
  readonly calendar: readonly DayInfo[];
  readonly result: OptimizationResult;
  readonly allBridges: readonly Bridge[];
  readonly loading: boolean;
}

function applyManualOverrides(
  calendar: readonly DayInfo[],
  overrides: Readonly<Record<string, LeaveType | null>>,
): readonly DayInfo[] {
  const overrideKeys = Object.keys(overrides);
  if (overrideKeys.length === 0) return calendar;

  return calendar.map((day) => {
    const override = overrides[day.dateKey];
    if (override === undefined) return day;
    if (override === null) return { ...day, type: "workday" as const };
    return { ...day, type: override };
  });
}

const EMPTY_RESULT: OptimizationResult = {
  selectedBridges: [],
  allocations: [],
  ptoUsed: 0,
  recoveryUsed: 0,
  totalDaysOff: 0,
  averageEfficiency: 0,
};

function runPipeline(config: AppConfig, holidays: readonly Holiday[]) {
  const baseCalendar = buildCalendar(config, holidays);
  const bridges = findBridges(baseCalendar);
  const scored = scoreBridges(bridges, config.strategy);
  const selectedBridges = optimize(
    scored,
    config.ptoBudget,
    config.recoveryBudget,
    config.blackoutDates,
    config.preBookedDates,
    config.disabledBridges,
  );
  const allAllocations = allocate(
    selectedBridges,
    config.ptoBudget,
    config.recoveryBudget,
    config.preBookedTypes,
  );

  let ptoUsed = 0;
  let recoveryUsed = 0;
  for (const a of allAllocations) {
    if (a.leaveType === "pto") ptoUsed++;
    else recoveryUsed++;
  }

  const totalPtoCost = selectedBridges.reduce((sum, b) => sum + b.ptoCost, 0);
  const totalDaysOff = selectedBridges.reduce(
    (sum, b) => sum + b.totalDaysOff,
    0,
  );
  const averageEfficiency = totalPtoCost > 0 ? totalDaysOff / totalPtoCost : 0;

  const result: OptimizationResult = {
    selectedBridges,
    allocations: allAllocations,
    ptoUsed,
    recoveryUsed,
    totalDaysOff,
    averageEfficiency,
  };

  const calendarWithAllocations = baseCalendar.map((day) => {
    const allocation = allAllocations.find(
      (a) => format(a.date, "yyyy-MM-dd") === day.dateKey,
    );
    if (allocation) return { ...day, type: allocation.leaveType };
    return day;
  });

  const mergedCalendar = applyManualOverrides(
    calendarWithAllocations,
    config.manualOverrides,
  );

  return { calendar: mergedCalendar, result, allBridges: scored };
}

interface HolidayState {
  readonly holidays: readonly Holiday[];
  readonly loading: boolean;
  readonly key: string;
}

export function useOptimization(config: AppConfig): OptimizationOutput {
  const loadKey = `${config.country}:${config.subdivision}:${config.year}`;
  const [state, setState] = useState<HolidayState>({
    holidays: [],
    loading: true,
    key: loadKey,
  });

  const loading = state.loading || state.key !== loadKey;

  useEffect(() => {
    let cancelled = false;

    loadHolidays(config.country, config.subdivision, config.year).then(
      (result) => {
        if (!cancelled) {
          setState({ holidays: result, loading: false, key: loadKey });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [config.country, config.subdivision, config.year, loadKey]);

  const output = useMemo(() => {
    if (loading || state.holidays.length === 0) {
      return {
        calendar: [],
        result: EMPTY_RESULT,
        allBridges: [],
      };
    }
    return runPipeline(config, state.holidays);
  }, [config, state.holidays, loading]);

  return { ...output, loading };
}
