import { describe, it, expect } from "vitest";
import { optimize } from "@/engine/optimizer";
import type { Bridge } from "@/engine/types";

function makeBridge(overrides: Partial<Bridge> & { id: string }): Bridge {
  return {
    days: [new Date(2026, 4, 15)],
    ptoCost: 1,
    totalDaysOff: 4,
    gainedDays: 1,
    efficiency: 1,
    adjacentHolidays: [],
    pontName: null,
    pontNameLocal: null,
    startDate: new Date(2026, 4, 14),
    endDate: new Date(2026, 4, 17),
    weightedScore: 5,
    ...overrides,
  };
}

describe("optimize", () => {
  it("selects bridges within budget", () => {
    const bridges = [
      makeBridge({ id: "a", ptoCost: 1, weightedScore: 10 }),
      makeBridge({
        id: "b",
        ptoCost: 2,
        weightedScore: 8,
        days: [new Date(2026, 5, 1), new Date(2026, 5, 2)],
      }),
    ];
    const selected = optimize(bridges, 2, 1, [], []);
    expect(selected.length).toBeGreaterThan(0);
    const totalCost = selected.reduce((sum, b) => sum + b.ptoCost, 0);
    expect(totalCost).toBeLessThanOrEqual(3);
  });

  it("skips bridges that exceed remaining budget", () => {
    const bridges = [
      makeBridge({
        id: "a",
        ptoCost: 5,
        weightedScore: 10,
        days: Array.from({ length: 5 }, (_, i) => new Date(2026, 5, i + 1)),
      }),
    ];
    const selected = optimize(bridges, 2, 2, [], []);
    expect(selected).toHaveLength(0);
  });

  it("skips bridges on blackout dates", () => {
    const bridges = [makeBridge({ id: "a", ptoCost: 1, weightedScore: 10 })];
    const selected = optimize(bridges, 5, 5, ["2026-05-15"], []);
    expect(selected).toHaveLength(0);
  });

  it("does not double-select overlapping bridges", () => {
    const bridges = [
      makeBridge({
        id: "a",
        ptoCost: 1,
        weightedScore: 10,
        days: [new Date(2026, 4, 15)],
      }),
      makeBridge({
        id: "b",
        ptoCost: 1,
        weightedScore: 8,
        days: [new Date(2026, 4, 15)],
      }),
    ];
    const selected = optimize(bridges, 5, 5, [], []);
    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe("a");
  });

  it("selects highest weighted score first", () => {
    const bridges = [
      makeBridge({
        id: "low",
        ptoCost: 1,
        weightedScore: 2,
        days: [new Date(2026, 4, 15)],
      }),
      makeBridge({
        id: "high",
        ptoCost: 1,
        weightedScore: 10,
        days: [new Date(2026, 5, 15)],
      }),
    ];
    const selected = optimize(bridges, 1, 0, [], []);
    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe("high");
  });

  it("does not subtract pre-booked dates from budget", () => {
    const bridges = [
      makeBridge({
        id: "a",
        ptoCost: 1,
        weightedScore: 10,
        days: [new Date(2026, 5, 15)],
      }),
    ];
    const selected = optimize(bridges, 1, 0, [], ["2026-03-15"]);
    expect(selected).toHaveLength(1);
  });

  it("returns empty array when budget is zero", () => {
    const bridges = [makeBridge({ id: "a" })];
    const selected = optimize(bridges, 0, 0, [], []);
    expect(selected).toHaveLength(0);
  });
});
