import { describe, it, expect } from "vitest";
import { findBridges } from "@/engine/bridge-finder";
import { buildCalendar } from "@/engine/calendar-utils";
import { getHolidaysForYear } from "@/data/france/holidays";
import { DEFAULT_CONFIG } from "@/engine/types";
import type { AppConfig } from "@/engine/types";

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return { ...DEFAULT_CONFIG, year: 2026, ...overrides };
}

function buildFranceCalendar(overrides: Partial<AppConfig> = {}) {
  const config = makeConfig(overrides);
  const holidays = getHolidaysForYear(config.year, config.subdivision);
  return buildCalendar(config, holidays);
}

const startOfYear = new Date(2026, 0, 1);

describe("findBridges", () => {
  it("detects bridges in 2026 metropolitan France", () => {
    const calendar = buildFranceCalendar();
    const bridges = findBridges(calendar, startOfYear);
    expect(bridges.length).toBeGreaterThan(0);
  });

  it("detects Ascension bridge (May 14 2026 is Thursday)", () => {
    const calendar = buildFranceCalendar();
    const bridges = findBridges(calendar, startOfYear);
    const ascensionBridge = bridges.find((b) =>
      b.adjacentHolidays.some((h) => h.includes("Ascension")),
    );
    expect(ascensionBridge).toBeDefined();
    expect(ascensionBridge!.pontName).toContain("Ascension");
  });

  it("detects July 14 bridge", () => {
    const calendar = buildFranceCalendar();
    const bridges = findBridges(calendar, startOfYear);
    const jul14Bridge = bridges.find((b) =>
      b.adjacentHolidays.some((h) => h.includes("Bastille")),
    );
    expect(jul14Bridge).toBeDefined();
  });

  it("each bridge has a positive PTO cost", () => {
    const calendar = buildFranceCalendar();
    const bridges = findBridges(calendar, startOfYear);
    for (const bridge of bridges) {
      expect(bridge.ptoCost).toBeGreaterThan(0);
    }
  });

  it("each bridge has totalDaysOff >= ptoCost", () => {
    const calendar = buildFranceCalendar();
    const bridges = findBridges(calendar, startOfYear);
    for (const bridge of bridges) {
      expect(bridge.totalDaysOff).toBeGreaterThanOrEqual(bridge.ptoCost);
    }
  });

  it("bridge days array length equals ptoCost", () => {
    const calendar = buildFranceCalendar();
    const bridges = findBridges(calendar, startOfYear);
    for (const bridge of bridges) {
      expect(bridge.days.length).toBe(bridge.ptoCost);
    }
  });

  it("does not create bridges longer than 4 PTO days", () => {
    const calendar = buildFranceCalendar();
    const bridges = findBridges(calendar, startOfYear);
    for (const bridge of bridges) {
      expect(bridge.ptoCost).toBeLessThanOrEqual(4);
    }
  });

  it("bridges have unique IDs", () => {
    const calendar = buildFranceCalendar();
    const bridges = findBridges(calendar, startOfYear);
    const ids = bridges.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("excludes bridges with PTO days in the past", () => {
    const calendar = buildFranceCalendar();
    const allBridges = findBridges(calendar, startOfYear);
    const midYear = new Date(2026, 6, 1);
    const futureBridges = findBridges(calendar, midYear);

    expect(futureBridges.length).toBeLessThan(allBridges.length);
    for (const bridge of futureBridges) {
      for (const day of bridge.days) {
        expect(day.getTime()).toBeGreaterThanOrEqual(midYear.getTime());
      }
    }
  });

  it("finds the bridge before New Year when the calendar has margin days", () => {
    const holidays = [2026, 2027].flatMap((y) =>
      getHolidaysForYear(y, "metropolitan"),
    );
    const calendar = buildCalendar(makeConfig(), holidays, 14);
    const bridges = findBridges(calendar, startOfYear);
    const yearEnd = bridges.find((b) => b.id === "bridge-2026-12-28");
    expect(yearEnd).toBeDefined();
    expect(yearEnd!.ptoCost).toBe(4);
    expect(yearEnd!.totalDaysOff).toBe(10);
  });

  it("keeps two bridges around the same holiday apart", () => {
    // Armistice 2026 is a Wednesday: Mon–Tue before and Thu–Fri after.
    const bridges = findBridges(buildFranceCalendar(), startOfYear);
    const armistice = bridges.filter((b) => b.pontName === "Armistice Day");
    expect(armistice.map((b) => b.id)).toEqual([
      "bridge-2026-11-09",
      "bridge-2026-11-12",
    ]);
  });

  it("ignores gaps that don't touch a holiday", () => {
    // A blackout on Wednesday splits a normal week into two short gaps.
    const calendar = buildFranceCalendar({ blackoutDates: ["2026-06-17"] });
    const bridges = findBridges(calendar, startOfYear);
    expect(bridges.some((b) => b.id === "bridge-2026-06-15")).toBe(false);
  });
});
