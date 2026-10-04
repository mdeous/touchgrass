export interface CountryMeta {
  readonly code: string;
  readonly name: string;
  readonly flag: string;
  readonly defaultPtoBudget: number;
  readonly hasRecoveryDays: boolean;
  readonly defaultRecoveryBudget: number;
  readonly weekendDays: readonly number[];
  readonly ptoLabel: string;
  readonly recoveryLabel: string;
  readonly hasSchoolZones: boolean;
  readonly subdivisionLabel: string;
}

const flag = (code: string): string => {
  const offset = 0x1f1e6 - 65;
  return String.fromCodePoint(
    code.charCodeAt(0) + offset,
    code.charCodeAt(1) + offset,
  );
};

const SUN_SAT: readonly number[] = [0, 6] as const;
const FRI_SAT: readonly number[] = [5, 6] as const;
const SAT_SUN: readonly number[] = [6, 0] as const;

const country = (
  code: string,
  name: string,
  defaultPtoBudget: number,
  options: {
    hasRecoveryDays?: boolean;
    defaultRecoveryBudget?: number;
    weekendDays?: readonly number[];
    ptoLabel?: string;
    recoveryLabel?: string;
    hasSchoolZones?: boolean;
    subdivisionLabel?: string;
  } = {},
): CountryMeta => ({
  code,
  name,
  flag: flag(code),
  defaultPtoBudget,
  hasRecoveryDays: options.hasRecoveryDays ?? false,
  defaultRecoveryBudget: options.defaultRecoveryBudget ?? 0,
  weekendDays: options.weekendDays ?? SUN_SAT,
  ptoLabel: options.ptoLabel ?? "Annual Leave",
  recoveryLabel: options.recoveryLabel ?? "",
  hasSchoolZones: options.hasSchoolZones ?? false,
  subdivisionLabel: options.subdivisionLabel ?? "Region",
});

const ALL_COUNTRIES: readonly CountryMeta[] = [
  country("AE", "United Arab Emirates", 30, {
    weekendDays: SAT_SUN,
    subdivisionLabel: "Emirate",
  }),
  country("AT", "Austria", 25, {
    ptoLabel: "Urlaub",
    subdivisionLabel: "Land",
  }),
  country("AU", "Australia", 20, {
    subdivisionLabel: "State",
  }),
  country("BE", "Belgium", 20),
  country("BR", "Brazil", 30, {
    ptoLabel: "Férias",
    subdivisionLabel: "State",
  }),
  country("CA", "Canada", 10, {
    ptoLabel: "Vacation",
    subdivisionLabel: "Province",
  }),
  country("CH", "Switzerland", 20, {
    ptoLabel: "Ferien",
    subdivisionLabel: "Canton",
  }),
  country("CZ", "Czech Republic", 20, {
    ptoLabel: "Dovolená",
  }),
  country("DE", "Germany", 20, {
    ptoLabel: "Urlaub",
    subdivisionLabel: "Land",
  }),
  country("DK", "Denmark", 25, {
    ptoLabel: "Ferie",
  }),
  country("ES", "Spain", 22, {
    ptoLabel: "Vacaciones",
    subdivisionLabel: "Community",
  }),
  country("FI", "Finland", 25, {
    ptoLabel: "Loma",
  }),
  country("FR", "France", 25, {
    hasRecoveryDays: true,
    defaultRecoveryBudget: 9,
    ptoLabel: "PTO",
    recoveryLabel: "RTT",
    hasSchoolZones: true,
  }),
  country("GB", "United Kingdom", 28, {
    subdivisionLabel: "Nation",
  }),
  country("GR", "Greece", 20, {
    ptoLabel: "Άδεια",
  }),
  country("IE", "Ireland", 20, {
    subdivisionLabel: "Province",
  }),
  country("IN", "India", 15, {
    ptoLabel: "Earned Leave",
    subdivisionLabel: "State",
  }),
  country("IT", "Italy", 20, {
    ptoLabel: "Ferie",
  }),
  country("JP", "Japan", 10, {
    ptoLabel: "有給休暇",
    subdivisionLabel: "Prefecture",
  }),
  country("LU", "Luxembourg", 26, {
    ptoLabel: "Congé",
    subdivisionLabel: "Canton",
  }),
  country("MX", "Mexico", 12, {
    ptoLabel: "Vacaciones",
    subdivisionLabel: "State",
  }),
  country("NL", "Netherlands", 20, {
    ptoLabel: "Vakantiedagen",
    subdivisionLabel: "Province",
  }),
  country("NO", "Norway", 25, {
    ptoLabel: "Ferie",
    subdivisionLabel: "County",
  }),
  country("NZ", "New Zealand", 20),
  country("PL", "Poland", 20, {
    ptoLabel: "Urlop",
    subdivisionLabel: "Voivodeship",
  }),
  country("PT", "Portugal", 22, {
    ptoLabel: "Férias",
    subdivisionLabel: "District",
  }),
  country("SA", "Saudi Arabia", 21, {
    weekendDays: FRI_SAT,
    ptoLabel: "إجازة",
  }),
  country("SE", "Sweden", 25, {
    ptoLabel: "Semester",
    subdivisionLabel: "County",
  }),
  country("SG", "Singapore", 7),
  country("US", "United States", 15, {
    ptoLabel: "PTO",
    subdivisionLabel: "State",
  }),
] as const;

export const COUNTRIES: readonly CountryMeta[] = [...ALL_COUNTRIES].sort(
  (a, b) => a.name.localeCompare(b.name),
);

export const COUNTRY_MAP: Record<string, CountryMeta> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
);

const FRANCE_FALLBACK = COUNTRY_MAP["FR"];

export const getCountryMeta = (code: string): CountryMeta =>
  Object.hasOwn(COUNTRY_MAP, code) ? COUNTRY_MAP[code] : FRANCE_FALLBACK;
