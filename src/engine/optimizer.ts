import { format } from "date-fns";
import type { Bridge } from "@/engine/types";

function getBridgeDateKeys(bridge: Bridge): Set<string> {
  return new Set(bridge.days.map((d) => format(d, "yyyy-MM-dd")));
}

export function optimize(
  bridges: readonly Bridge[],
  cpBudget: number,
  rttBudget: number,
  blackoutDates: readonly string[],
  preBookedDates: readonly string[],
  disabledBridges: readonly string[] = [],
): Bridge[] {
  const blackoutSet = new Set(blackoutDates);
  const preBookedSet = new Set(preBookedDates);
  const disabledSet = new Set(disabledBridges);

  const preBookedCost = preBookedDates.length;

  let remainingBudget = cpBudget + rttBudget - preBookedCost;
  const usedDates = new Set<string>();
  const selected: Bridge[] = [];

  const sorted = [...bridges].sort((a, b) => b.weightedScore - a.weightedScore);

  for (const bridge of sorted) {
    if (remainingBudget <= 0) break;

    if (bridge.pontName && disabledSet.has(bridge.pontName)) continue;

    const dateKeys = getBridgeDateKeys(bridge);

    let hasConflict = false;
    for (const key of dateKeys) {
      if (blackoutSet.has(key) || usedDates.has(key) || preBookedSet.has(key)) {
        hasConflict = true;
        break;
      }
    }
    if (hasConflict) continue;

    if (bridge.ptoCost > remainingBudget) continue;

    selected.push(bridge);
    remainingBudget -= bridge.ptoCost;
    for (const key of dateKeys) {
      usedDates.add(key);
    }
  }

  return selected;
}
