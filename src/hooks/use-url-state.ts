import { useEffect, useRef } from "react";
import { encodeConfig, decodeConfig } from "@/export/url-encoder";
import { useAppStore } from "@/store/app-store";
import type { AppConfig } from "@/engine/types";

function getConfigFromStore(): AppConfig {
  const s = useAppStore.getState();
  return {
    year: s.year,
    region: s.region,
    schoolZone: s.schoolZone,
    ptoBudget: s.ptoBudget,
    recoveryBudget: s.recoveryBudget,
    strategy: s.strategy,
    blackoutDates: s.blackoutDates,
    preBookedDates: s.preBookedDates,
    preBookedTypes: s.preBookedTypes,
    customHolidays: s.customHolidays,
    manualOverrides: s.manualOverrides,
    disabledBridges: s.disabledBridges,
  };
}

export function useUrlState() {
  const year = useAppStore((s) => s.year);
  const region = useAppStore((s) => s.region);
  const schoolZone = useAppStore((s) => s.schoolZone);
  const ptoBudget = useAppStore((s) => s.ptoBudget);
  const recoveryBudget = useAppStore((s) => s.recoveryBudget);
  const strategy = useAppStore((s) => s.strategy);
  const blackoutDates = useAppStore((s) => s.blackoutDates);
  const preBookedDates = useAppStore((s) => s.preBookedDates);
  const customHolidays = useAppStore((s) => s.customHolidays);
  const disabledBridges = useAppStore((s) => s.disabledBridges);

  const initializedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const decoded = decodeConfig(hash);
    if (!decoded) return;

    const store = useAppStore.getState();
    store.setYear(decoded.year);
    store.setRegion(decoded.region);
    store.setSchoolZone(decoded.schoolZone);
    store.setPtoBudget(decoded.ptoBudget);
    store.setRecoveryBudget(decoded.recoveryBudget);
    store.setStrategy(decoded.strategy);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const config = getConfigFromStore();
      const hash = encodeConfig(config);
      window.history.replaceState(null, "", `#${hash}`);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    year,
    region,
    schoolZone,
    ptoBudget,
    recoveryBudget,
    strategy,
    blackoutDates,
    preBookedDates,
    customHolidays,
    disabledBridges,
  ]);
}
