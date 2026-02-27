import { describe, it, expect } from "vitest";
import { buildCalendar } from "@/engine/calendar-utils";
import { getHolidaysForYear } from "@/data/france/holidays";
import type { AppConfig } from "@/engine/types";
import { DEFAULT_CONFIG } from "@/engine/types";

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return { ...DEFAULT_CONFIG, year: 2026, ...overrides };
}

function buildFranceCalendar(overrides: Partial<AppConfig> = {}) {
  const config = makeConfig(overrides);
  const holidays = getHolidaysForYear(config.year, config.subdivision);
  return buildCalendar(config, holidays);
}

describe("buildCalendar", () => {
  it("returns 365 days for a non-leap year (2026)", () => {
    const calendar = buildFranceCalendar();
    expect(calendar).toHaveLength(365);
  });

  it("returns 366 days for a leap year (2028)", () => {
    const calendar = buildFranceCalendar({ year: 2028 });
    expect(calendar).toHaveLength(366);
  });

  it("starts on Jan 1 and ends on Dec 31", () => {
    const calendar = buildFranceCalendar();
    expect(calendar[0].dateKey).toBe("2026-01-01");
    expect(calendar[calendar.length - 1].dateKey).toBe("2026-12-31");
  });

  it("marks weekends correctly", () => {
    const calendar = buildFranceCalendar();
    const weekends = calendar.filter((d) => d.isWeekend);
    expect(weekends.length).toBeGreaterThan(100);
    for (const day of weekends) {
      expect([0, 6]).toContain(day.dayOfWeek);
    }
  });

  it("marks holidays with holiday info", () => {
    const calendar = buildFranceCalendar();
    const holidays = calendar.filter((d) => d.holiday !== null);
    expect(holidays.length).toBe(11);
  });

  it("marks holiday type correctly for non-weekend holidays", () => {
    const calendar = buildFranceCalendar();
    const may1 = calendar.find((d) => d.dateKey === "2026-05-01");
    expect(may1).toBeDefined();
    expect(may1!.holiday).not.toBeNull();
    expect(may1!.type).toBe("holiday");
  });

  it("applies blackout dates", () => {
    const calendar = buildFranceCalendar({
      blackoutDates: ["2026-06-15"],
    });
    const day = calendar.find((d) => d.dateKey === "2026-06-15");
    expect(day!.type).toBe("blackout");
  });

  it("applies pre-booked dates with correct type", () => {
    const calendar = buildFranceCalendar({
      preBookedDates: ["2026-03-16"],
      preBookedTypes: { "2026-03-16": "recovery" },
    });
    const day = calendar.find((d) => d.dateKey === "2026-03-16");
    expect(day!.type).toBe("prebooked-recovery");
  });

  it("applies custom holidays", () => {
    const calendar = buildFranceCalendar({
      customHolidays: ["2026-06-15"],
    });
    const day = calendar.find((d) => d.dateKey === "2026-06-15");
    expect(day!.holiday).not.toBeNull();
    expect(day!.type).toBe("holiday");
  });

  it("has correct dateKey format", () => {
    const calendar = buildFranceCalendar();
    for (const day of calendar) {
      expect(day.dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("marks school holidays when zone is set", () => {
    const calendar = buildFranceCalendar({ schoolZone: "A" });
    const schoolDays = calendar.filter((d) => d.isSchoolHoliday);
    expect(schoolDays.length).toBeGreaterThan(0);
  });

  it("has no school holidays when zone is none", () => {
    const calendar = buildFranceCalendar({ schoolZone: "none" });
    const schoolDays = calendar.filter((d) => d.isSchoolHoliday);
    expect(schoolDays).toHaveLength(0);
  });

  it("respects custom weekendDays", () => {
    const calendar = buildFranceCalendar({ weekendDays: [5, 6] });
    const weekends = calendar.filter((d) => d.isWeekend);
    for (const day of weekends) {
      expect([5, 6]).toContain(day.dayOfWeek);
    }
    const sunday = calendar.find((d) => d.dayOfWeek === 0 && d.holiday === null);
    expect(sunday!.isWeekend).toBe(false);
  });
});
