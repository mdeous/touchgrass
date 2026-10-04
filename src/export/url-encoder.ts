import type {
  AppConfig,
  SchoolZone,
  Strategy,
  LeaveType,
} from "@/engine/types";
import { DEFAULT_CONFIG } from "@/engine/types";
import { COUNTRY_MAP } from "@/data/country-meta";
import { LANGUAGES } from "@/i18n/languages";

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
  l?: string;
}

export const MAX_BUDGET = 50;
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;
/** Upper bound on any list of dates read from a URL. */
const MAX_DATES = 1000;

const SCHOOL_ZONES: readonly SchoolZone[] = ["A", "B", "C", "none"];
const STRATEGIES: readonly Strategy[] = ["balanced", "long-weekends", "extended"];
const LEAVE_TYPES: readonly LeaveType[] = ["pto", "recovery"];
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const SUBDIVISION = /^[A-Za-z0-9_-]{1,40}$/;
const BRIDGE_ID = /^bridge-\d{4}-\d{2}-\d{2}$/;

// btoa only accepts Latin-1, so go through UTF-8 bytes first.
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): string {
  const padded =
    str.replace(/-/g, "+").replace(/_/g, "/") +
    "==".slice(0, (4 - (str.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function arraysEqual(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export function encodeConfig(config: AppConfig, language?: string): string {
  // The year is always written: the default is "this year", so leaving it
  // out would make a link change meaning on Jan 1.
  const compact: CompactConfig = { y: config.year };

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
  if (language && language !== "en") compact.l = language;

  return toBase64Url(JSON.stringify(compact));
}

export interface DecodedUrl {
  readonly config: AppConfig;
  readonly language?: string;
}

function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_KEY.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 && date.getDate() === d;
}

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function budget(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(MAX_BUDGET, Math.round(value)));
}

function dateList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(isDateKey))].slice(0, MAX_DATES);
}

function dateRecord<T>(
  value: unknown,
  accept: (v: unknown) => v is T,
): Record<string, T> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  const entries = Object.entries(value).filter(
    ([k, v]) => isDateKey(k) && accept(v),
  );
  return Object.fromEntries(entries.slice(0, MAX_DATES));
}

const isLeaveType = (v: unknown): v is LeaveType =>
  LEAVE_TYPES.includes(v as LeaveType);
const isOverride = (v: unknown): v is LeaveType | null =>
  v === null || isLeaveType(v);

function weekendDays(value: unknown): readonly number[] {
  if (!Array.isArray(value)) return DEFAULT_CONFIG.weekendDays;
  const days = [
    ...new Set(
      value.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) as number[],
    ),
  ];
  // At least one workday must remain.
  return days.length === value.length && days.length < 7
    ? days
    : DEFAULT_CONFIG.weekendDays;
}

/**
 * Reads a config from a URL hash. Every field is checked; anything missing or
 * invalid falls back to the default, so a hand-edited link can't crash the app.
 */
export function decodeConfig(hash: string): DecodedUrl | null {
  let compact: CompactConfig;
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(hash));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }
    compact = parsed as CompactConfig;
  } catch {
    return null;
  }

  const year =
    Number.isInteger(compact.y) &&
    (compact.y as number) >= MIN_YEAR &&
    (compact.y as number) <= MAX_YEAR
      ? (compact.y as number)
      : DEFAULT_CONFIG.year;
  const country =
    typeof compact.cc === "string" && compact.cc in COUNTRY_MAP
      ? compact.cc
      : DEFAULT_CONFIG.country;
  const rawSubdivision = compact.sd ?? compact.r;
  const subdivision =
    typeof rawSubdivision === "string" && SUBDIVISION.test(rawSubdivision)
      ? rawSubdivision
      : country === "FR"
        ? DEFAULT_CONFIG.subdivision
        : "default";

  const preBookedDates = dateList(compact.p);
  const preBookedTypes = dateRecord(compact.pt, isLeaveType);
  const preBookedSet = new Set(preBookedDates);
  for (const key of Object.keys(preBookedTypes)) {
    if (!preBookedSet.has(key)) delete preBookedTypes[key];
  }

  const language = LANGUAGES.some((l) => l.code === compact.l)
    ? compact.l
    : undefined;

  return {
    config: {
      year,
      country,
      subdivision,
      weekendDays: weekendDays(compact.wd),
      schoolZone: oneOf(compact.z, SCHOOL_ZONES, DEFAULT_CONFIG.schoolZone),
      ptoBudget: budget(compact.c, DEFAULT_CONFIG.ptoBudget),
      recoveryBudget: budget(compact.t, DEFAULT_CONFIG.recoveryBudget),
      strategy: oneOf(compact.s, STRATEGIES, DEFAULT_CONFIG.strategy),
      blackoutDates: dateList(compact.b),
      preBookedDates,
      preBookedTypes,
      customHolidays: dateList(compact.ch),
      manualOverrides: dateRecord(compact.mo, isOverride),
      // Older links stored holiday names here; only stable ids are kept.
      disabledBridges: Array.isArray(compact.db)
        ? [
            ...new Set(
              compact.db.filter(
                (id): id is string =>
                  typeof id === "string" && BRIDGE_ID.test(id),
              ),
            ),
          ].slice(0, MAX_DATES)
        : [],
    },
    language,
  };
}
