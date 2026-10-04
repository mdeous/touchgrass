import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUrlState } from "@/hooks/use-url-state";
import { useAppStore } from "@/store/app-store";
import { encodeConfig } from "@/export/url-encoder";
import { DEFAULT_CONFIG } from "@/engine/types";

describe("useUrlState", () => {
  it("restores every setting from a shared link", () => {
    const shared = {
      ...DEFAULT_CONFIG,
      year: 2027,
      ptoBudget: 12,
      blackoutDates: ["2027-03-01"],
      preBookedDates: ["2027-04-02"],
      preBookedTypes: { "2027-04-02": "pto" as const },
      customHolidays: ["2027-06-07"],
      manualOverrides: { "2027-05-11": null },
      disabledBridges: ["bridge-2027-05-07"],
    };
    window.location.hash = `#${encodeConfig(shared)}`;

    renderHook(() => useUrlState());

    const s = useAppStore.getState();
    expect(s.year).toBe(2027);
    expect(s.ptoBudget).toBe(12);
    expect(s.blackoutDates).toEqual(shared.blackoutDates);
    expect(s.preBookedDates).toEqual(shared.preBookedDates);
    expect(s.preBookedTypes).toEqual(shared.preBookedTypes);
    expect(s.customHolidays).toEqual(shared.customHolidays);
    expect(s.manualOverrides).toEqual(shared.manualOverrides);
    expect(s.disabledBridges).toEqual(shared.disabledBridges);
  });
});
