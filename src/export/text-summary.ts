import { format, differenceInCalendarDays } from "date-fns";
import i18n from "@/i18n";
import { getDateLocale } from "@/i18n/get-date-locale";
import { formatShortDate, formatFullDate } from "@/lib/format-date";
import type {
  Allocation,
  Bridge,
  LeaveType,
  OptimizationResult,
} from "@/engine/types";
import type { CountryMeta } from "@/data/country-meta";

function formatBridge(bridge: Bridge): string {
  const locale = getDateLocale();
  const displayName =
    i18n.language === "en" ? bridge.pontName : bridge.pontNameLocal;
  const name = displayName
    ? i18n.t("export.pontTitle", { name: displayName })
    : i18n.t("export.ptoBreak");
  const lang = i18n.language;
  const start = formatShortDate(bridge.startDate, locale, lang);
  const end = formatFullDate(bridge.endDate, locale, lang);
  const eff = Number.isInteger(bridge.efficiency)
    ? String(bridge.efficiency)
    : bridge.efficiency.toFixed(1);

  return [
    `${name}`,
    `  ${start} - ${end}`,
    `  ${i18n.t("export.daysOff", { count: bridge.totalDaysOff })}, ${i18n.t("export.ptoDays", { count: bridge.ptoCost })} (${i18n.t("export.efficiency", { value: eff })})`,
  ].join("\n");
}

export function generateTextSummary(
  result: OptimizationResult,
  year: number,
  meta?: CountryMeta,
): string {
  const header = i18n.t("export.planHeader", { year });
  const separator = "=".repeat(header.length);

  const bridges = result.selectedBridges.map(formatBridge).join("\n\n");

  const ptoLabel = meta?.ptoLabel || "PTO";
  const lines = [
    "",
    "-".repeat(30),
    i18n.t("export.totalDaysOff", { count: result.totalDaysOff }),
    i18n.t("export.labelUsed", { label: ptoLabel, count: result.ptoUsed }),
  ];

  if (meta?.hasRecoveryDays && result.recoveryUsed > 0) {
    const recoveryLabel = meta.recoveryLabel || "Recovery";
    lines.push(
      i18n.t("export.labelUsed", {
        label: recoveryLabel,
        count: result.recoveryUsed,
      }),
    );
  }

  const effValue = Number.isInteger(result.averageEfficiency)
    ? result.averageEfficiency
    : result.averageEfficiency.toFixed(1);
  lines.push(
    i18n.t("export.avgEfficiency", { value: effValue }),
    i18n.t("export.numBreaks", { count: result.selectedBridges.length }),
  );

  const totals = lines.join("\n");

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
  const locale = getDateLocale();
  const lang = i18n.language;
  if (range.start.getTime() === range.end.getTime()) {
    return formatShortDate(range.start, locale, lang);
  }
  const sameMonth =
    range.start.getMonth() === range.end.getMonth() &&
    range.start.getFullYear() === range.end.getFullYear();
  if (sameMonth) {
    if (lang === "fr") {
      return `${format(range.start, "d", { locale })}-${formatShortDate(range.end, locale, lang)}`;
    }
    return `${formatShortDate(range.start, locale, lang)}-${format(range.end, "d", { locale })}`;
  }
  return `${formatShortDate(range.start, locale, lang)} - ${formatShortDate(range.end, locale, lang)}`;
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
  meta?: CountryMeta,
): string {
  const groups = groupAllocations(allocations);
  if (groups.length === 0) return "";

  const sections = groups.map((g) => {
    let label: string;
    if (g.leaveType === "pto") {
      label = meta?.ptoLabel || "PTO";
    } else {
      label = meta?.recoveryLabel || "Recovery";
    }
    const header = i18n.t("timeOff.daysToRequest", {
      label,
      count: g.count,
    });
    const lines = g.lines.map((l) => `  ${l}`).join("\n");
    return `${header}\n${lines}`;
  });

  return sections.join("\n\n");
}
