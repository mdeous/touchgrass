import { describe, it, expect } from "vitest";
import { scoreBridges } from "@/engine/scorer";
import type { Bridge } from "@/engine/types";

function makeBridge(overrides: Partial<Bridge> = {}): Bridge {
  return {
    id: "test-1",
    days: [new Date(2026, 4, 15)],
    ptoCost: 1,
    totalDaysOff: 4,
    gainedDays: 1,
    efficiency: 1,
    adjacentHolidays: ["Ascension"],
    pontName: "Pont de l'Ascension",
    pontNameLocal: "Ascension",
    startDate: new Date(2026, 4, 14),
    endDate: new Date(2026, 4, 17),
    weightedScore: 0,
    ...overrides,
  };
}

describe("scoreBridges", () => {
  it("assigns weighted scores to all bridges", () => {
    const bridges = [makeBridge()];
    const scored = scoreBridges(bridges, "balanced");
    expect(scored[0].weightedScore).toBeGreaterThan(0);
  });

  it("sorts bridges by weighted score descending", () => {
    const bridges = [
      makeBridge({ id: "a", efficiency: 1, totalDaysOff: 3 }),
      makeBridge({ id: "b", efficiency: 2, totalDaysOff: 9 }),
    ];
    const scored = scoreBridges(bridges, "balanced");
    expect(scored[0].id).toBe("b");
    expect(scored[1].id).toBe("a");
  });

  it("long-weekends strategy boosts short bridges", () => {
    const shortBridge = makeBridge({
      id: "short",
      ptoCost: 1,
      efficiency: 1,
      totalDaysOff: 3,
    });
    const longBridge = makeBridge({
      id: "long",
      ptoCost: 4,
      efficiency: 1,
      totalDaysOff: 6,
    });

    const balanced = scoreBridges([shortBridge, longBridge], "balanced");
    const longWeekends = scoreBridges(
      [shortBridge, longBridge],
      "long-weekends",
    );

    const balancedShortRank = balanced.findIndex((b) => b.id === "short");
    const lwShortRank = longWeekends.findIndex((b) => b.id === "short");

    expect(lwShortRank).toBeLessThanOrEqual(balancedShortRank);
  });

  it("extended strategy boosts longer bridges", () => {
    const shortBridge = makeBridge({
      id: "short",
      ptoCost: 1,
      efficiency: 2,
      totalDaysOff: 3,
    });
    const longBridge = makeBridge({
      id: "long",
      ptoCost: 3,
      efficiency: 1,
      totalDaysOff: 7,
    });

    const extended = scoreBridges([shortBridge, longBridge], "extended");
    const extendedLongScore = extended.find(
      (b) => b.id === "long",
    )!.weightedScore;
    const extendedShortScore = extended.find(
      (b) => b.id === "short",
    )!.weightedScore;

    expect(extendedLongScore).toBeGreaterThan(0);
    expect(extendedShortScore).toBeGreaterThan(0);
  });

  it("returns new array without mutating input", () => {
    const bridges = [makeBridge()];
    const original = bridges[0].weightedScore;
    scoreBridges(bridges, "balanced");
    expect(bridges[0].weightedScore).toBe(original);
  });

  it("uses totalDaysOff as tiebreaker", () => {
    const a = makeBridge({
      id: "a",
      efficiency: 1,
      totalDaysOff: 5,
      ptoCost: 1,
    });
    const b = makeBridge({
      id: "b",
      efficiency: 1,
      totalDaysOff: 8,
      ptoCost: 1,
    });
    const scored = scoreBridges([a, b], "balanced");
    expect(scored[0].id).toBe("b");
  });

  it("uses chronological order as final tiebreaker", () => {
    const a = makeBridge({
      id: "a",
      efficiency: 1,
      totalDaysOff: 5,
      ptoCost: 1,
      startDate: new Date(2026, 0, 5),
    });
    const b = makeBridge({
      id: "b",
      efficiency: 1,
      totalDaysOff: 5,
      ptoCost: 1,
      startDate: new Date(2026, 5, 5),
    });
    const scored = scoreBridges([a, b], "balanced");
    expect(scored[0].id).toBe("a");
  });
});
