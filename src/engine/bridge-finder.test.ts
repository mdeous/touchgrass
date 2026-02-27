import { describe, it, expect } from "vitest";
import { findBridges } from "@/engine/bridge-finder";
import { buildCalendar } from "@/engine/calendar-utils";
import { DEFAULT_CONFIG } from "@/engine/types";
import type { AppConfig } from "@/engine/types";

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return { ...DEFAULT_CONFIG, year: 2026, ...overrides };
}

describe("findBridges", () => {
  it("detects bridges in 2026 metropolitan France", () => {
    const calendar = buildCalendar(makeConfig());
    const bridges = findBridges(calendar);
    expect(bridges.length).toBeGreaterThan(0);
  });

  it("detects Ascension bridge (May 14 2026 is Thursday)", () => {
    const calendar = buildCalendar(makeConfig());
    const bridges = findBridges(calendar);
    const ascensionBridge = bridges.find((b) =>
      b.adjacentHolidays.some((h) => h.includes("Ascension")),
    );
    expect(ascensionBridge).toBeDefined();
    expect(ascensionBridge!.pontName).toContain("Ascension");
  });

  it("detects July 14 bridge", () => {
    const calendar = buildCalendar(makeConfig());
    const bridges = findBridges(calendar);
    const jul14Bridge = bridges.find((b) =>
      b.adjacentHolidays.some((h) => h.includes("Bastille")),
    );
    expect(jul14Bridge).toBeDefined();
  });

  it("each bridge has a positive PTO cost", () => {
    const calendar = buildCalendar(makeConfig());
    const bridges = findBridges(calendar);
    for (const bridge of bridges) {
      expect(bridge.ptoCost).toBeGreaterThan(0);
    }
  });

  it("each bridge has totalDaysOff >= ptoCost", () => {
    const calendar = buildCalendar(makeConfig());
    const bridges = findBridges(calendar);
    for (const bridge of bridges) {
      expect(bridge.totalDaysOff).toBeGreaterThanOrEqual(bridge.ptoCost);
    }
  });

  it("bridge days array length equals ptoCost", () => {
    const calendar = buildCalendar(makeConfig());
    const bridges = findBridges(calendar);
    for (const bridge of bridges) {
      expect(bridge.days.length).toBe(bridge.ptoCost);
    }
  });

  it("does not create bridges longer than 4 PTO days", () => {
    const calendar = buildCalendar(makeConfig());
    const bridges = findBridges(calendar);
    for (const bridge of bridges) {
      expect(bridge.ptoCost).toBeLessThanOrEqual(4);
    }
  });

  it("bridges have unique IDs", () => {
    const calendar = buildCalendar(makeConfig());
    const bridges = findBridges(calendar);
    const ids = bridges.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
