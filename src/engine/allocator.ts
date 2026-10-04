import type { Allocation, Bridge, LeaveType } from "@/engine/types";

/**
 * Assigns a leave type to every leave day of the selected breaks. Recovery
 * days go first, to the shortest breaks first, then PTO. `ptoAvailable` and
 * `recoveryAvailable` are what is left after pre-booked and manual leave.
 */
export function allocate(
  selectedBridges: readonly Bridge[],
  ptoAvailable: number,
  recoveryAvailable: number,
): Allocation[] {
  let ptoRemaining = ptoAvailable;
  let recoveryRemaining = recoveryAvailable;

  const sortedBridges = [...selectedBridges].sort(
    (a, b) => a.ptoCost - b.ptoCost,
  );

  const allocations: Allocation[] = [];
  for (const bridge of sortedBridges) {
    for (const day of bridge.days) {
      let leaveType: LeaveType;
      if (recoveryRemaining > 0) {
        leaveType = "recovery";
        recoveryRemaining--;
      } else if (ptoRemaining > 0) {
        leaveType = "pto";
        ptoRemaining--;
      } else {
        continue;
      }
      allocations.push({ date: new Date(day.getTime()), leaveType });
    }
  }

  return allocations.sort((a, b) => a.date.getTime() - b.date.getTime());
}
