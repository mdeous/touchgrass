export type SchoolZone = "A" | "B" | "C" | "none";

export type Strategy = "balanced" | "long-weekends" | "extended";

export type DayType =
  | "workday"
  | "weekend"
  | "holiday"
  | "pto"
  | "recovery"
  | "blackout"
  | "prebooked-pto"
  | "prebooked-recovery";

export type LeaveType = "pto" | "recovery";

export interface Holiday {
  readonly date: Date;
  readonly name: string;
  readonly nameEn: string;
}

export interface DayInfo {
  readonly date: Date;
  readonly dateKey: string;
  readonly dayOfWeek: number;
  readonly isWeekend: boolean;
  readonly holiday: Holiday | null;
  readonly type: DayType;
  readonly isSchoolHoliday: boolean;
  readonly schoolZoneName: string | null;
  /** False for margin days borrowed from the previous or next year. */
  readonly inYear: boolean;
}

export interface Bridge {
  readonly id: string;
  readonly days: readonly Date[];
  readonly ptoCost: number;
  readonly totalDaysOff: number;
  readonly gainedDays: number;
  readonly efficiency: number;
  readonly adjacentHolidays: readonly string[];
  readonly pontName: string | null;
  readonly pontNameLocal: string | null;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly weightedScore: number;
}

export interface Allocation {
  readonly date: Date;
  readonly leaveType: LeaveType;
}

export interface OptimizationResult {
  readonly selectedBridges: readonly Bridge[];
  readonly allocations: readonly Allocation[];
  readonly ptoUsed: number;
  readonly recoveryUsed: number;
  readonly totalDaysOff: number;
  readonly averageEfficiency: number;
}

export interface AppConfig {
  readonly year: number;
  readonly country: string;
  readonly subdivision: string;
  readonly weekendDays: readonly number[];
  readonly schoolZone: SchoolZone;
  readonly ptoBudget: number;
  readonly recoveryBudget: number;
  readonly strategy: Strategy;
  readonly blackoutDates: readonly string[];
  readonly preBookedDates: readonly string[];
  readonly preBookedTypes: Readonly<Record<string, LeaveType>>;
  readonly customHolidays: readonly string[];
  readonly manualOverrides: Readonly<Record<string, LeaveType | null>>;
  readonly disabledBridges: readonly string[];
}

export interface SchoolHolidayPeriod {
  readonly name: string;
  readonly start: string;
  readonly end: string;
}

export interface SchoolYear {
  readonly year: string;
  readonly zones: Readonly<Record<string, readonly SchoolHolidayPeriod[]>>;
}

export const DEFAULT_CONFIG: AppConfig = {
  year: new Date().getFullYear(),
  country: "FR",
  subdivision: "metropolitan",
  weekendDays: [0, 6],
  schoolZone: "none",
  ptoBudget: 25,
  recoveryBudget: 9,
  strategy: "balanced",
  blackoutDates: [],
  preBookedDates: [],
  preBookedTypes: {},
  customHolidays: [],
  manualOverrides: {},
  disabledBridges: [],
};
