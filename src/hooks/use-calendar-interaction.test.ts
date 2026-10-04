import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCalendarInteraction } from "@/hooks/use-calendar-interaction";
import { useAppStore } from "@/store/app-store";
import type { DayInfo, DayType } from "@/engine/types";

function day(dateKey: string, type: DayType): DayInfo {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    date,
    dateKey,
    dayOfWeek: date.getDay(),
    isWeekend: false,
    holiday: null,
    type,
    isSchoolHoliday: false,
    schoolZoneName: null,
    inYear: true,
  };
}

const calendar = [
  day("2026-06-10", "workday"),
  day("2026-12-28", "recovery"),
  day("2026-06-13", "weekend"),
];

function click(dateKey: string, ptoRemaining = 5, recoveryRemaining = 0) {
  const { result } = renderHook(() =>
    useCalendarInteraction(calendar, ptoRemaining, recoveryRemaining),
  );
  result.current.onToggle(dateKey);
}

describe("useCalendarInteraction", () => {
  beforeEach(() => useAppStore.setState({ manualOverrides: {} }));

  it("forces a day the optimizer picked back to a workday", () => {
    click("2026-12-28");
    expect(useAppStore.getState().manualOverrides).toEqual({ "2026-12-28": null });
  });

  it("books a workday as leave when budget is left", () => {
    click("2026-06-10", 5, 0);
    expect(useAppStore.getState().manualOverrides).toEqual({ "2026-06-10": "pto" });
  });

  it("does not book leave when no budget is left", () => {
    click("2026-06-10", 0, 0);
    expect(useAppStore.getState().manualOverrides).toEqual({});
  });

  it("removes an existing override, including a forced workday", () => {
    useAppStore.setState({ manualOverrides: { "2026-12-28": null } });
    click("2026-12-28");
    expect(useAppStore.getState().manualOverrides).toEqual({});
  });

  it("ignores weekends", () => {
    click("2026-06-13");
    expect(useAppStore.getState().manualOverrides).toEqual({});
  });
});
