import { describe, it, expect } from "vitest";
import { format } from "date-fns";
import { optimize } from "@/engine/optimizer";
import { buildCalendar } from "@/engine/calendar-utils";
import { getHolidaysForYear } from "@/data/france/holidays";
import { DEFAULT_CONFIG } from "@/engine/types";
import type { AppConfig, Bridge, Strategy } from "@/engine/types";

function franceCalendar(overrides: Partial<AppConfig> = {}) {
  const config = { ...DEFAULT_CONFIG, year: 2026, ...overrides };
  const holidays = [2025, 2026, 2027].flatMap((y) =>
    getHolidaysForYear(y, "metropolitan"),
  );
  return buildCalendar(config, holidays, 14);
}

function run(
  options: {
    budget?: number;
    strategy?: Strategy;
    blocked?: string[];
    forcedLeave?: string[];
    calendar?: ReturnType<typeof franceCalendar>;
  } = {},
): Bridge[] {
  return optimize({
    calendar: options.calendar ?? franceCalendar(),
    budget: options.budget ?? 34,
    strategy: options.strategy ?? "balanced",
    blocked: new Set(options.blocked ?? []),
    forcedLeave: new Set(options.forcedLeave ?? []),
  });
}

const keys = (bridges: readonly Bridge[]) =>
  bridges.flatMap((b) => b.days.map((d) => format(d, "yyyy-MM-dd")));

describe("optimize", () => {
  it("never spends more than the budget", () => {
    for (const budget of [0, 1, 3, 10, 34]) {
      const spent = run({ budget }).reduce((s, b) => s + b.ptoCost, 0);
      expect(spent).toBeLessThanOrEqual(budget);
    }
  });

  it("returns nothing with a zero budget", () => {
    expect(run({ budget: 0 })).toEqual([]);
  });

  it("only builds efficient breaks around a holiday", () => {
    for (const strategy of ["long-weekends", "balanced", "extended"] as const) {
      for (const b of run({ strategy })) {
        expect(b.efficiency).toBeGreaterThanOrEqual(2);
        expect(b.adjacentHolidays.length).toBeGreaterThan(0);
      }
    }
  });

  it("returns breaks that don't overlap", () => {
    const breaks = run({ strategy: "extended" });
    for (let i = 1; i < breaks.length; i++) {
      expect(breaks[i].startDate.getTime()).toBeGreaterThan(
        breaks[i - 1].endDate.getTime(),
      );
    }
  });

  it("bridges the 2026 Christmas–New Year gap across the year boundary", () => {
    const breaks = run();
    const leave = keys(breaks);
    for (const day of ["2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31"]) {
      expect(leave).toContain(day);
    }
    const christmas = breaks.find((b) => b.days.some((d) => d.getMonth() === 11 && d.getDate() === 28))!;
    expect(format(christmas.endDate, "yyyy-MM-dd")).toBe("2027-01-03");
  });

  it("never places leave outside the year", () => {
    for (const day of keys(run({ strategy: "extended" }))) {
      expect(day.startsWith("2026-")).toBe(true);
    }
  });

  it("gives different plans for different strategies", () => {
    const plans = (["long-weekends", "balanced", "extended"] as const).map(
      (strategy) => keys(run({ strategy })).join(","),
    );
    expect(new Set(plans).size).toBe(3);
  });

  it("prefers short breaks for long-weekends", () => {
    for (const b of run({ strategy: "long-weekends" })) {
      expect(b.totalDaysOff).toBeLessThanOrEqual(5);
    }
  });

  it("does not place leave on blocked days", () => {
    const blocked = ["2026-05-15", "2026-12-28"];
    const leave = keys(run({ blocked }));
    for (const day of blocked) expect(leave).not.toContain(day);
  });

  it("treats forced leave as already off", () => {
    // Taking Mon 2026-05-11 by hand; the optimizer must not count it again.
    const breaks = run({ forcedLeave: ["2026-05-11"] });
    expect(keys(breaks)).not.toContain("2026-05-11");
  });

  it("does not use a blackout day", () => {
    const calendar = franceCalendar({ blackoutDates: ["2026-05-15"] });
    expect(keys(run({ calendar }))).not.toContain("2026-05-15");
  });
});

describe("optimize with untrusted input", () => {
  it("handles a huge or invalid budget without blowing up", () => {
    for (const budget of [1e9, Infinity, NaN, -5]) {
      const breaks = run({ budget });
      expect(Array.isArray(breaks)).toBe(true);
    }
  });

  it("falls back to balanced for an unknown strategy", () => {
    const unknown = run({ strategy: "nope" as Strategy });
    expect(keys(unknown)).toEqual(keys(run({ strategy: "balanced" })));
  });
});
