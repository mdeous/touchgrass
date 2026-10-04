import { describe, it, expect } from "vitest";
import { buildIcs } from "@/export/ics-generator";
import type { Bridge, OptimizationResult } from "@/engine/types";

const ascension: Bridge = {
  id: "break-2026-05-15",
  days: [new Date(2026, 4, 15)],
  ptoCost: 1,
  totalDaysOff: 4,
  gainedDays: 3,
  efficiency: 4,
  adjacentHolidays: ["Ascension Thursday"],
  pontName: "Ascension Thursday",
  pontNameLocal: "Ascension",
  startDate: new Date(2026, 4, 14),
  endDate: new Date(2026, 4, 17),
  weightedScore: 0,
};

function result(selectedBridges: Bridge[]): OptimizationResult {
  return {
    selectedBridges,
    allocations: [],
    ptoUsed: 0,
    recoveryUsed: 1,
    totalDaysOff: 4,
    averageEfficiency: 4,
  };
}

describe("buildIcs", () => {
  it("ends all-day events the day after the break (exclusive DTEND)", () => {
    const ics = buildIcs(result([ascension]), 2026)!;
    expect(ics).toContain("DTSTART;VALUE=DATE:20260514");
    expect(ics).toContain("DTEND;VALUE=DATE:20260518");
  });

  it("uses a stable UID", () => {
    const a = buildIcs(result([ascension]), 2026)!;
    const b = buildIcs(result([ascension]), 2026)!;
    const uid = (s: string) => s.match(/^UID:(.*)$/m)![1];
    expect(uid(a)).toBe(uid(b));
  });

  it("returns null when there is nothing to export", () => {
    expect(buildIcs(result([]), 2026)).toBeNull();
  });
});
