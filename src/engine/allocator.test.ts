import { describe, it, expect } from "vitest";
import { allocate } from "@/engine/allocator";
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

describe("allocate", () => {
  it("assigns recovery to single-day bridges", () => {
    const bridges = [
      makeBridge({ id: "a", ptoCost: 1, days: [new Date(2026, 4, 15)] }),
    ];
    const allocations = allocate(bridges, 25, 9);
    expect(allocations).toHaveLength(1);
    expect(allocations[0].leaveType).toBe("recovery");
  });

  it("assigns recovery to multi-day bridges", () => {
    const bridges = [
      makeBridge({
        id: "b",
        ptoCost: 3,
        days: [
          new Date(2026, 4, 11),
          new Date(2026, 4, 12),
          new Date(2026, 4, 13),
        ],
      }),
    ];
    const allocations = allocate(bridges, 25, 9);
    expect(allocations).toHaveLength(3);
    for (const a of allocations) {
      expect(a.leaveType).toBe("recovery");
    }
  });

  it("falls back to PTO when recovery exhausted for single-day", () => {
    const bridges = [
      makeBridge({ id: "a", ptoCost: 1, days: [new Date(2026, 4, 15)] }),
    ];
    const allocations = allocate(bridges, 25, 0);
    expect(allocations).toHaveLength(1);
    expect(allocations[0].leaveType).toBe("pto");
  });

  it("assigns recovery to multi-day bridges even with no PTO", () => {
    const bridges = [
      makeBridge({
        id: "c",
        ptoCost: 2,
        days: [new Date(2026, 4, 11), new Date(2026, 4, 12)],
      }),
    ];
    const allocations = allocate(bridges, 0, 9);
    expect(allocations).toHaveLength(2);
    for (const a of allocations) {
      expect(a.leaveType).toBe("recovery");
    }
  });

  it("falls back to PTO when recovery exhausted for multi-day", () => {
    const bridges = [
      makeBridge({
        id: "d",
        ptoCost: 3,
        days: [
          new Date(2026, 4, 11),
          new Date(2026, 4, 12),
          new Date(2026, 4, 13),
        ],
      }),
    ];
    const allocations = allocate(bridges, 25, 0);
    expect(allocations).toHaveLength(3);
    for (const a of allocations) {
      expect(a.leaveType).toBe("pto");
    }
  });

  it("gives recovery to the shortest breaks first", () => {
    const long = makeBridge({
      id: "long",
      ptoCost: 2,
      days: [new Date(2026, 4, 11), new Date(2026, 4, 12)],
    });
    const short = makeBridge({
      id: "short",
      ptoCost: 1,
      days: [new Date(2026, 4, 15)],
    });
    const allocations = allocate([long, short], 25, 1);
    const typeOn = (day: number) =>
      allocations.find((a) => a.date.getDate() === day)!.leaveType;
    expect(typeOn(15)).toBe("recovery");
    expect(typeOn(11)).toBe("pto");
    expect(typeOn(12)).toBe("pto");
  });

  it("skips days once both budgets are spent", () => {
    const bridges = [
      makeBridge({
        id: "a",
        ptoCost: 2,
        days: [new Date(2026, 4, 11), new Date(2026, 4, 12)],
      }),
    ];
    expect(allocate(bridges, 1, 0)).toHaveLength(1);
  });

  it("returns empty array when no bridges selected", () => {
    const allocations = allocate([], 25, 9);
    expect(allocations).toHaveLength(0);
  });
});
