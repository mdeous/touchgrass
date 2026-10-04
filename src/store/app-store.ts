import { create } from "zustand";
import type {
  AppConfig,
  LeaveType,
  SchoolZone,
  Strategy,
} from "@/engine/types";
import { DEFAULT_CONFIG } from "@/engine/types";
import { getCountryMeta } from "@/data/country-meta";

interface AppState extends AppConfig {
  setYear: (year: number) => void;
  setCountry: (country: string) => void;
  setSubdivision: (subdivision: string) => void;
  setWeekendDays: (days: readonly number[]) => void;
  setSchoolZone: (zone: SchoolZone) => void;
  setPtoBudget: (budget: number) => void;
  setRecoveryBudget: (budget: number) => void;
  setStrategy: (strategy: Strategy) => void;
  addBlackoutDate: (dateKey: string) => void;
  removeBlackoutDate: (dateKey: string) => void;
  addPreBookedDate: (dateKey: string, leaveType: LeaveType) => void;
  removePreBookedDate: (dateKey: string) => void;
  addCustomHoliday: (dateKey: string) => void;
  removeCustomHoliday: (dateKey: string) => void;
  toggleManualOverride: (dateKey: string, leaveType: LeaveType | null) => void;
  toggleBridgeDisabled: (bridgeId: string) => void;
  resetConfig: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  ...DEFAULT_CONFIG,

  setYear: (year) => set({ year }),

  setCountry: (country) => {
    const meta = getCountryMeta(country);
    set({
      country,
      subdivision: "default",
      weekendDays: meta.weekendDays,
      ptoBudget: meta.defaultPtoBudget,
      recoveryBudget: meta.defaultRecoveryBudget,
      schoolZone: meta.hasSchoolZones ? "none" : "none",
      disabledBridges: [],
      manualOverrides: {},
    });
  },

  setSubdivision: (subdivision) => set({ subdivision }),

  setWeekendDays: (weekendDays) => set({ weekendDays }),

  setSchoolZone: (schoolZone) => set({ schoolZone }),

  setPtoBudget: (ptoBudget) => set({ ptoBudget }),

  setRecoveryBudget: (recoveryBudget) => set({ recoveryBudget }),

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
    set((state) => ({
      preBookedDates: state.preBookedDates.filter((d) => d !== dateKey),
      preBookedTypes: Object.fromEntries(
        Object.entries(state.preBookedTypes).filter(([k]) => k !== dateKey),
      ),
    })),

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
        return {
          manualOverrides: Object.fromEntries(
            Object.entries(state.manualOverrides).filter(
              ([k]) => k !== dateKey,
            ),
          ),
        };
      }
      return {
        manualOverrides: { ...state.manualOverrides, [dateKey]: leaveType },
      };
    }),

  toggleBridgeDisabled: (bridgeId) =>
    set((state) => ({
      disabledBridges: state.disabledBridges.includes(bridgeId)
        ? state.disabledBridges.filter((id) => id !== bridgeId)
        : [...state.disabledBridges, bridgeId],
    })),

  resetConfig: () =>
    set({
      ...DEFAULT_CONFIG,
      year: new Date().getFullYear(),
    }),
}));
