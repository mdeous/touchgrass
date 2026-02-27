export type Region = 'metropolitan' | 'alsace-moselle' | 'guadeloupe' | 'martinique' | 'guyane' | 'reunion' | 'mayotte'

export type SchoolZone = 'A' | 'B' | 'C' | 'none'

export type Strategy = 'balanced' | 'long-weekends' | 'extended'

export type DayType =
  | 'workday'
  | 'weekend'
  | 'holiday'
  | 'cp'
  | 'rtt'
  | 'blackout'
  | 'prebooked-cp'
  | 'prebooked-rtt'

export type LeaveType = 'cp' | 'rtt'

export interface Holiday {
  readonly date: Date
  readonly name: string
  readonly nameEn: string
}

export interface DayInfo {
  readonly date: Date
  readonly dateKey: string
  readonly dayOfWeek: number
  readonly isWeekend: boolean
  readonly holiday: Holiday | null
  readonly type: DayType
  readonly isSchoolHoliday: boolean
  readonly schoolZoneName: string | null
}

export interface Bridge {
  readonly id: string
  readonly days: readonly Date[]
  readonly ptoCost: number
  readonly totalDaysOff: number
  readonly gainedDays: number
  readonly efficiency: number
  readonly adjacentHolidays: readonly string[]
  readonly pontName: string | null
  readonly startDate: Date
  readonly endDate: Date
  readonly weightedScore: number
}

export interface Allocation {
  readonly date: Date
  readonly leaveType: LeaveType
}

export interface OptimizationResult {
  readonly selectedBridges: readonly Bridge[]
  readonly allocations: readonly Allocation[]
  readonly cpUsed: number
  readonly rttUsed: number
  readonly totalDaysOff: number
  readonly averageEfficiency: number
}

export interface AppConfig {
  readonly year: number
  readonly region: Region
  readonly schoolZone: SchoolZone
  readonly cpBudget: number
  readonly rttBudget: number
  readonly strategy: Strategy
  readonly blackoutDates: readonly string[]
  readonly preBookedDates: readonly string[]
  readonly preBookedTypes: Readonly<Record<string, LeaveType>>
  readonly customHolidays: readonly string[]
  readonly manualOverrides: Readonly<Record<string, LeaveType | null>>
}

export interface SchoolHolidayPeriod {
  readonly name: string
  readonly start: string
  readonly end: string
}

export interface SchoolYear {
  readonly year: string
  readonly zones: Readonly<Record<string, readonly SchoolHolidayPeriod[]>>
}

export const DEFAULT_CONFIG: AppConfig = {
  year: new Date().getFullYear(),
  region: 'metropolitan',
  schoolZone: 'none',
  cpBudget: 25,
  rttBudget: 9,
  strategy: 'balanced',
  blackoutDates: [],
  preBookedDates: [],
  preBookedTypes: {},
  customHolidays: [],
  manualOverrides: {},
}
