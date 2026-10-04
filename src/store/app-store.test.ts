import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/store/app-store";
import { DEFAULT_CONFIG } from "@/engine/types";

describe("app store date lists", () => {
  beforeEach(() => useAppStore.setState({ ...DEFAULT_CONFIG }));

  it("keeps a date in only one list", () => {
    const store = useAppStore.getState();
    store.addBlackoutDate("2026-06-10");
    store.addPreBookedDate("2026-06-10", "recovery");
    let s = useAppStore.getState();
    expect(s.blackoutDates).toEqual([]);
    expect(s.preBookedDates).toEqual(["2026-06-10"]);
    expect(s.preBookedTypes).toEqual({ "2026-06-10": "recovery" });

    store.addCustomHoliday("2026-06-10");
    s = useAppStore.getState();
    expect(s.preBookedDates).toEqual([]);
    expect(s.preBookedTypes).toEqual({});
    expect(s.customHolidays).toEqual(["2026-06-10"]);
  });

  it("does not duplicate a date added twice", () => {
    const store = useAppStore.getState();
    store.addBlackoutDate("2026-06-10");
    store.addBlackoutDate("2026-06-10");
    expect(useAppStore.getState().blackoutDates).toEqual(["2026-06-10"]);
  });

  it("switching to France selects metropolitan France", () => {
    const store = useAppStore.getState();
    store.setCountry("DE");
    store.setCountry("FR");
    expect(useAppStore.getState().subdivision).toBe("metropolitan");
  });
});
