import { format, differenceInCalendarDays } from "date-fns";
import type {
  Allocation,
  Bridge,
  LeaveType,
  OptimizationResult,
} from "@/engine/types";

function formatBridge(bridge: Bridge): string {
  const name = bridge.pontName ? `Pont: ${bridge.pontName}` : "PTO Break";
  const start = format(bridge.startDate, "MMM d");
  const end = format(bridge.endDate, "MMM d, yyyy");
  const eff = Number.isInteger(bridge.efficiency)
    ? String(bridge.efficiency)
    : bridge.efficiency.toFixed(1);

  return [
    `${name}`,
    `  ${start} - ${end}`,
    `  ${bridge.totalDaysOff} days off, ${bridge.ptoCost} PTO day${bridge.ptoCost !== 1 ? "s" : ""} (${eff}:1 efficiency)`,
  ].join("\n");
}

export function generateTextSummary(
  result: OptimizationResult,
  year: number,
): string {
  const header = `TouchGrass PTO Plan ${year}`;
  const separator = "=".repeat(header.length);

  const bridges = result.selectedBridges.map(formatBridge).join("\n\n");

  const totals = [
    "",
    "-".repeat(30),
    `Total days off: ${result.totalDaysOff}`,
    `PTO used: ${result.ptoUsed}`,
    `Recovery (RTT) used: ${result.recoveryUsed}`,
    `Average efficiency: ${Number.isInteger(result.averageEfficiency) ? result.averageEfficiency : result.averageEfficiency.toFixed(1)}:1`,
    `Number of breaks: ${result.selectedBridges.length}`,
  ].join("\n");

  return [header, separator, "", bridges, totals, ""].join("\n");
}

interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

function collapseToRanges(dates: readonly Date[]): readonly DateRange[] {
  if (dates.length === 0) return [];

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());

  const ranges: DateRange[] = [];
  let rangeStart = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (differenceInCalendarDays(sorted[i], prev) === 1) {
      prev = sorted[i];
    } else {
      ranges.push({ start: rangeStart, end: prev });
      rangeStart = sorted[i];
      prev = sorted[i];
    }
  }
  ranges.push({ start: rangeStart, end: prev });

  return ranges;
}

function formatRange(range: DateRange): string {
  if (range.start.getTime() === range.end.getTime()) {
    return format(range.start, "MMM d");
  }
  if (
    range.start.getMonth() === range.end.getMonth() &&
    range.start.getFullYear() === range.end.getFullYear()
  ) {
    return `${format(range.start, "MMM d")}-${format(range.end, "d")}`;
  }
  return `${format(range.start, "MMM d")} - ${format(range.end, "MMM d")}`;
}

export interface TimeOffGroup {
  readonly leaveType: LeaveType;
  readonly count: number;
  readonly ranges: readonly DateRange[];
  readonly lines: readonly string[];
}

export function groupAllocations(
  allocations: readonly Allocation[],
): readonly TimeOffGroup[] {
  const byType: Record<LeaveType, Date[]> = { pto: [], recovery: [] };
  for (const a of allocations) {
    byType[a.leaveType].push(a.date);
  }

  const groups: TimeOffGroup[] = [];
  for (const leaveType of ["pto", "recovery"] as const) {
    const dates = byType[leaveType];
    if (dates.length === 0) continue;
    const ranges = collapseToRanges(dates);
    groups.push({
      leaveType,
      count: dates.length,
      ranges,
      lines: ranges.map(formatRange),
    });
  }
  return groups;
}

export function generateTimeOffSummary(
  allocations: readonly Allocation[],
): string {
  const groups = groupAllocations(allocations);
  if (groups.length === 0) return "";

  const sections = groups.map((g) => {
    const label = g.leaveType === "pto" ? "PTO" : "Recovery (RTT)";
    const header = `${label} days to request (${g.count} day${g.count !== 1 ? "s" : ""})`;
    const lines = g.lines.map((l) => `  ${l}`).join("\n");
    return `${header}\n${lines}`;
  });

  return sections.join("\n\n");
}
