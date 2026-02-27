import { format } from "date-fns";
import type { Allocation, Bridge, LeaveType } from "@/engine/types";

export function allocate(
  selectedBridges: readonly Bridge[],
  ptoBudget: number,
  recoveryBudget: number,
  preBookedTypes: Readonly<Record<string, LeaveType>>,
): Allocation[] {
  let ptoRemaining = ptoBudget;
  let recoveryRemaining = recoveryBudget;

  for (const dateKey of Object.keys(preBookedTypes)) {
    const type = preBookedTypes[dateKey];
    if (type === "pto") ptoRemaining--;
    else recoveryRemaining--;
  }

  const preBookedAllocations: Allocation[] = Object.entries(preBookedTypes).map(
    ([dateKey, leaveType]) => {
      const [y, m, d] = dateKey.split("-").map(Number);
      return { date: new Date(y, m - 1, d), leaveType };
    },
  );

  const bridgeAllocations: Allocation[] = [];

  const sortedBridges = [...selectedBridges].sort(
    (a, b) => a.ptoCost - b.ptoCost,
  );

  for (const bridge of sortedBridges) {
    for (const day of bridge.days) {
      const dateKey = format(day, "yyyy-MM-dd");
      if (preBookedTypes[dateKey]) continue;

      let assignedType: LeaveType;

      if (recoveryRemaining > 0) {
        assignedType = "recovery";
        recoveryRemaining--;
      } else if (ptoRemaining > 0) {
        assignedType = "pto";
        ptoRemaining--;
      } else {
        continue;
      }

      bridgeAllocations.push({
        date: new Date(day.getTime()),
        leaveType: assignedType,
      });
    }
  }

  return [...preBookedAllocations, ...bridgeAllocations];
}
