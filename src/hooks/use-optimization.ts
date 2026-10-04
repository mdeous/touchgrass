import { useMemo, useState, useEffect } from "react";
import { runPipeline } from "@/engine/pipeline";
import { loadHolidays } from "@/data/holiday-loader";
import type {
  AppConfig,
  Bridge,
  DayInfo,
  Holiday,
  OptimizationResult,
} from "@/engine/types";

interface OptimizationOutput {
  readonly calendar: readonly DayInfo[];
  readonly result: OptimizationResult;
  readonly allBridges: readonly Bridge[];
  readonly loading: boolean;
  /** True when no holiday data exists for the selected country and year. */
  readonly noData: boolean;
}

const EMPTY_RESULT: OptimizationResult = {
  selectedBridges: [],
  allocations: [],
  ptoUsed: 0,
  recoveryUsed: 0,
  totalDaysOff: 0,
  averageEfficiency: 0,
};

interface HolidayState {
  /** Holidays for the year before, the year itself and the year after. */
  readonly holidays: readonly Holiday[];
  readonly hasYearData: boolean;
  readonly loading: boolean;
  readonly key: string;
}

async function loadAround(
  country: string,
  subdivision: string,
  year: number,
): Promise<{ holidays: Holiday[]; hasYearData: boolean }> {
  const [before, current, after] = await Promise.all(
    [year - 1, year, year + 1].map((y) =>
      loadHolidays(country, subdivision, y).catch(() => [] as Holiday[]),
    ),
  );
  return {
    holidays: [...before, ...current, ...after],
    hasYearData: current.length > 0,
  };
}

export function useOptimization(config: AppConfig): OptimizationOutput {
  const loadKey = `${config.country}:${config.subdivision}:${config.year}`;
  const [state, setState] = useState<HolidayState>({
    holidays: [],
    hasYearData: false,
    loading: true,
    key: loadKey,
  });

  const loading = state.loading || state.key !== loadKey;

  useEffect(() => {
    let cancelled = false;

    loadAround(config.country, config.subdivision, config.year).then(
      ({ holidays, hasYearData }) => {
        if (!cancelled) {
          setState({ holidays, hasYearData, loading: false, key: loadKey });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [config.country, config.subdivision, config.year, loadKey]);

  const noData = !loading && !state.hasYearData;

  const output = useMemo(() => {
    if (loading || noData) {
      return { calendar: [], result: EMPTY_RESULT, allBridges: [] };
    }
    const { calendar, result, candidates } = runPipeline(config, state.holidays);
    return { calendar, result, allBridges: candidates };
  }, [config, state.holidays, loading, noData]);

  return { ...output, loading, noData };
}
