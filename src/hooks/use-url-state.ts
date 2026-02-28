import { useEffect, useRef } from "react";
import i18n from "@/i18n";
import { encodeConfig, decodeConfig } from "@/export/url-encoder";
import { useAppStore } from "@/store/app-store";
import type { AppConfig } from "@/engine/types";

function getConfigFromStore(): AppConfig {
  const s = useAppStore.getState();
  return {
    year: s.year,
    country: s.country,
    subdivision: s.subdivision,
    weekendDays: s.weekendDays,
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

function writeHash() {
  const config = getConfigFromStore();
  const hash = encodeConfig(config, i18n.language);
  window.history.replaceState(null, "", `#${hash}`);
}

export function useUrlState() {
  const year = useAppStore((s) => s.year);
  const country = useAppStore((s) => s.country);
  const subdivision = useAppStore((s) => s.subdivision);
  const weekendDays = useAppStore((s) => s.weekendDays);
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

    const { config: cfg, language } = decoded;

    if (language) {
      i18n.changeLanguage(language);
    }

    const store = useAppStore.getState();
    if (cfg.country !== "FR" || cfg.subdivision !== "metropolitan") {
      store.setCountry(cfg.country);
      store.setSubdivision(cfg.subdivision);
    }
    store.setYear(cfg.year);
    store.setWeekendDays(cfg.weekendDays);
    store.setSchoolZone(cfg.schoolZone);
    store.setPtoBudget(cfg.ptoBudget);
    store.setRecoveryBudget(cfg.recoveryBudget);
    store.setStrategy(cfg.strategy);
  }, []);

  // Re-encode hash on language change
  useEffect(() => {
    const handler = () => writeHash();
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      writeHash();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    year,
    country,
    subdivision,
    weekendDays,
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
