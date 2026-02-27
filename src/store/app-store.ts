import { create } from 'zustand'
import type { AppConfig, LeaveType, Region, SchoolZone, Strategy } from '@/engine/types'
import { DEFAULT_CONFIG } from '@/engine/types'

interface AppState extends AppConfig {
  setYear: (year: number) => void
  setRegion: (region: Region) => void
  setSchoolZone: (zone: SchoolZone) => void
  setCpBudget: (budget: number) => void
  setRttBudget: (budget: number) => void
  setStrategy: (strategy: Strategy) => void
  addBlackoutDate: (dateKey: string) => void
  removeBlackoutDate: (dateKey: string) => void
  addPreBookedDate: (dateKey: string, leaveType: LeaveType) => void
  removePreBookedDate: (dateKey: string) => void
  addCustomHoliday: (dateKey: string) => void
  removeCustomHoliday: (dateKey: string) => void
  toggleManualOverride: (dateKey: string, leaveType: LeaveType | null) => void
  resetConfig: () => void
}

export const useAppStore = create<AppState>()((set) => ({
  ...DEFAULT_CONFIG,

  setYear: (year) => set({ year }),

  setRegion: (region) => set({ region }),

  setSchoolZone: (schoolZone) => set({ schoolZone }),

  setCpBudget: (cpBudget) => set({ cpBudget }),

  setRttBudget: (rttBudget) => set({ rttBudget }),

  setStrategy: (strategy) => set({ strategy }),

  addBlackoutDate: (dateKey) =>
    set((state) => ({
      blackoutDates: state.blackoutDates.includes(dateKey)
        ? state.blackoutDates
        : [...state.blackoutDates, dateKey],
    })),

  removeBlackoutDate: (dateKey) =>
    set((state) => ({
      blackoutDates: state.blackoutDates.filter((d) => d !== dateKey),
    })),

  addPreBookedDate: (dateKey, leaveType) =>
    set((state) => ({
      preBookedDates: state.preBookedDates.includes(dateKey)
        ? state.preBookedDates
        : [...state.preBookedDates, dateKey],
      preBookedTypes: { ...state.preBookedTypes, [dateKey]: leaveType },
    })),

  removePreBookedDate: (dateKey) =>
    set((state) => {
      const { [dateKey]: _, ...remainingTypes } = state.preBookedTypes
      return {
        preBookedDates: state.preBookedDates.filter((d) => d !== dateKey),
        preBookedTypes: remainingTypes,
      }
    }),

  addCustomHoliday: (dateKey) =>
    set((state) => ({
      customHolidays: state.customHolidays.includes(dateKey)
        ? state.customHolidays
        : [...state.customHolidays, dateKey],
    })),

  removeCustomHoliday: (dateKey) =>
    set((state) => ({
      customHolidays: state.customHolidays.filter((d) => d !== dateKey),
    })),

  toggleManualOverride: (dateKey, leaveType) =>
    set((state) => {
      if (leaveType === null) {
        const { [dateKey]: _, ...remaining } = state.manualOverrides
        return { manualOverrides: remaining }
      }
      return {
        manualOverrides: { ...state.manualOverrides, [dateKey]: leaveType },
      }
    }),

  resetConfig: () =>
    set({
      ...DEFAULT_CONFIG,
      year: new Date().getFullYear(),
    }),
}))
