import { addDays, format } from "date-fns";
import { createEvents, type EventAttributes } from "ics";
import i18n from "@/i18n";
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
    // All-day DTEND is exclusive (RFC 5545), so it is the day after the break.
    const end = toDateArray(addDays(bridge.endDate, 1));
    const displayName =
      i18n.language === "en" ? bridge.pontName : bridge.pontNameLocal;
    const title = displayName
      ? i18n.t("export.pontTitle", { name: displayName })
      : i18n.t("export.ptoTitle");

    return {
      // Stable per break, so re-importing updates events instead of duplicating.
      uid: `touchgrass-${format(bridge.startDate, "yyyyMMdd")}@touchgrass`,
      title,
      start,
      end,
      description: i18n.t("export.bridgeDesc", {
        total: bridge.totalDaysOff,
        count: bridge.ptoCost,
      }),
      calName: i18n.t("export.calendarName", { year }),
    };
  });
}

export function buildIcs(result: OptimizationResult, year: number): string | null {
  const events = buildEvents(result, year);
  if (events.length === 0) return null;

  const { error, value } = createEvents(events);
  if (error || !value) {
    throw new Error("Failed to generate ICS content");
  }
  return value;
}

/** Downloads the plan as an .ics file. Returns false when there is nothing to export. */
export function downloadIcs(result: OptimizationResult, year: number): boolean {
  const value = buildIcs(result, year);
  if (value === null) return false;

  const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `touchgrass-${year}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoking right away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
