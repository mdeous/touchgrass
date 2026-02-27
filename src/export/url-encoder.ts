import type { AppConfig, SchoolZone, Strategy, LeaveType } from "@/engine/types";
import { DEFAULT_CONFIG } from "@/engine/types";

interface CompactConfig {
  y?: number;
  cc?: string;
  sd?: string;
  wd?: number[];
  r?: string;
  z?: string;
  c?: number;
  t?: number;
  s?: string;
  b?: string[];
  p?: string[];
  pt?: Record<string, string>;
  ch?: string[];
  mo?: Record<string, string | null>;
  db?: string[];
}

function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): string {
  const padded =
    str.replace(/-/g, "+").replace(/_/g, "/") +
    "==".slice(0, (4 - (str.length % 4)) % 4);
  return atob(padded);
}

function arraysEqual(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export function encodeConfig(config: AppConfig): string {
  const compact: CompactConfig = {};

  if (config.year !== DEFAULT_CONFIG.year) compact.y = config.year;
  if (config.country !== DEFAULT_CONFIG.country) compact.cc = config.country;
  if (config.subdivision !== DEFAULT_CONFIG.subdivision)
    compact.sd = config.subdivision;
  if (!arraysEqual(config.weekendDays, DEFAULT_CONFIG.weekendDays))
    compact.wd = [...config.weekendDays];
  if (config.schoolZone !== DEFAULT_CONFIG.schoolZone)
    compact.z = config.schoolZone;
  if (config.ptoBudget !== DEFAULT_CONFIG.ptoBudget)
    compact.c = config.ptoBudget;
  if (config.recoveryBudget !== DEFAULT_CONFIG.recoveryBudget)
    compact.t = config.recoveryBudget;
  if (config.strategy !== DEFAULT_CONFIG.strategy) compact.s = config.strategy;
  if (config.blackoutDates.length > 0) compact.b = [...config.blackoutDates];
  if (config.preBookedDates.length > 0) compact.p = [...config.preBookedDates];
  if (Object.keys(config.preBookedTypes).length > 0)
    compact.pt = { ...config.preBookedTypes };
  if (config.customHolidays.length > 0) compact.ch = [...config.customHolidays];
  if (Object.keys(config.manualOverrides).length > 0) {
    compact.mo = { ...config.manualOverrides };
  }
  if (config.disabledBridges.length > 0)
    compact.db = [...config.disabledBridges];

  return toBase64Url(JSON.stringify(compact));
}

export function decodeConfig(hash: string): AppConfig | null {
  try {
    const json = fromBase64Url(hash);
    const compact = JSON.parse(json) as CompactConfig;

    const country = compact.cc ?? DEFAULT_CONFIG.country;
    const subdivision =
      compact.sd ?? compact.r ?? DEFAULT_CONFIG.subdivision;

    return {
      year: compact.y ?? DEFAULT_CONFIG.year,
      country,
      subdivision,
      weekendDays: compact.wd ?? DEFAULT_CONFIG.weekendDays,
      schoolZone: (compact.z as SchoolZone) ?? DEFAULT_CONFIG.schoolZone,
      ptoBudget: compact.c ?? DEFAULT_CONFIG.ptoBudget,
      recoveryBudget: compact.t ?? DEFAULT_CONFIG.recoveryBudget,
      strategy: (compact.s as Strategy) ?? DEFAULT_CONFIG.strategy,
      blackoutDates: compact.b ?? [],
      preBookedDates: compact.p ?? [],
      preBookedTypes: (compact.pt as Record<string, LeaveType>) ?? {},
      customHolidays: compact.ch ?? [],
      manualOverrides: (compact.mo as Record<string, LeaveType | null>) ?? {},
      disabledBridges: compact.db ?? [],
    };
  } catch {
    return null;
  }
}
