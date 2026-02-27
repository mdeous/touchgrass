import type {
  AppConfig,
  Region,
  SchoolZone,
  Strategy,
  LeaveType,
} from "@/engine/types";
import { DEFAULT_CONFIG } from "@/engine/types";

interface CompactConfig {
  y?: number;
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

export function encodeConfig(config: AppConfig): string {
  const compact: CompactConfig = {};

  if (config.year !== DEFAULT_CONFIG.year) compact.y = config.year;
  if (config.region !== DEFAULT_CONFIG.region) compact.r = config.region;
  if (config.schoolZone !== DEFAULT_CONFIG.schoolZone)
    compact.z = config.schoolZone;
  if (config.cpBudget !== DEFAULT_CONFIG.cpBudget) compact.c = config.cpBudget;
  if (config.rttBudget !== DEFAULT_CONFIG.rttBudget)
    compact.t = config.rttBudget;
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

    return {
      year: compact.y ?? DEFAULT_CONFIG.year,
      region: (compact.r as Region) ?? DEFAULT_CONFIG.region,
      schoolZone: (compact.z as SchoolZone) ?? DEFAULT_CONFIG.schoolZone,
      cpBudget: compact.c ?? DEFAULT_CONFIG.cpBudget,
      rttBudget: compact.t ?? DEFAULT_CONFIG.rttBudget,
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
