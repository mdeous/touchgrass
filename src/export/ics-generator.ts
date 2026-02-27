import { createEvents, type EventAttributes } from "ics";
import type { OptimizationResult } from "@/engine/types";

function toDateArray(date: Date): [number, number, number] {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
}

function buildEvents(
  result: OptimizationResult,
  year: number,
): EventAttributes[] {
  return result.selectedBridges.map((bridge) => {
    const start = toDateArray(bridge.startDate);
    const end = toDateArray(bridge.endDate);
    const title = bridge.pontName ?? "PTO";
    const durationDays = bridge.totalDaysOff;

    return {
      title,
      start,
      end,
      description: `${durationDays} days off (${bridge.ptoCost} PTO day${bridge.ptoCost !== 1 ? "s" : ""})`,
      calName: `TouchGrass ${year}`,
    };
  });
}

export function downloadIcs(result: OptimizationResult, year: number): void {
  const events = buildEvents(result, year);
  if (events.length === 0) return;

  const { error, value } = createEvents(events);
  if (error || !value) {
    throw new Error("Failed to generate ICS content");
  }

  const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `touchgrass-${year}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
