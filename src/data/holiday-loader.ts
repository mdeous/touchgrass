import type { Holiday } from "@/engine/types";
import { getHolidaysForYear } from "@/data/france/holidays";

interface GeneratedHoliday {
  readonly date: string;
  readonly name: string;
  readonly type: string;
}

interface GeneratedCountryData {
  readonly subdivisions: Readonly<Record<string, string>>;
  readonly holidays: Readonly<
    Record<string, Readonly<Record<string, readonly GeneratedHoliday[]>>>
  >;
}

const moduleCache = new Map<string, GeneratedCountryData>();

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function transformHolidays(raw: readonly GeneratedHoliday[]): Holiday[] {
  return raw.map((h) => ({
    date: parseDate(h.date),
    name: h.name,
    nameEn: h.name,
  }));
}

async function loadCountryModule(
  country: string,
): Promise<GeneratedCountryData | null> {
  const cached = moduleCache.get(country);
  if (cached) return cached;

  try {
    const mod = await import(`./generated/holidays/${country}.json`);
    const data = (mod.default ?? mod) as GeneratedCountryData;
    moduleCache.set(country, data);
    return data;
  } catch {
    return null;
  }
}

export async function loadHolidays(
  country: string,
  subdivision: string,
  year: number,
): Promise<Holiday[]> {
  if (country === "FR") {
    return getHolidaysForYear(year, subdivision);
  }

  const data = await loadCountryModule(country);
  if (!data) return [];

  const sub = subdivision in (data.holidays ?? {}) ? subdivision : "default";
  const yearStr = String(year);
  const holidays = data.holidays?.[sub]?.[yearStr];
  if (!holidays) return [];

  return transformHolidays(holidays);
}

export async function loadSubdivisions(
  country: string,
): Promise<Record<string, string>> {
  if (country === "FR") {
    const { REGIONS } = await import("@/data/france/regions");
    const result: Record<string, string> = {};
    for (const r of REGIONS) {
      result[r.id] = r.label;
    }
    return result;
  }

  const data = await loadCountryModule(country);
  if (!data) return { default: country };

  return { ...data.subdivisions };
}
