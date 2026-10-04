import { describe, it, expect } from "vitest";
import { breakValue, leaveDayCost } from "@/engine/scorer";
import type { Strategy } from "@/engine/types";

const strategies: Strategy[] = ["long-weekends", "balanced", "extended"];

describe("breakValue", () => {
  it("is zero for an empty break", () => {
    for (const s of strategies) expect(breakValue(0, 0, s)).toBe(0);
  });

  it("grows with the free days captured", () => {
    for (const s of strategies) {
      expect(breakValue(4, 3, s)).toBeGreaterThan(breakValue(4, 2, s));
    }
  });

  it("never loses value when two breaks are joined, except for long weekends", () => {
    // Two 9-day breaks with 5 free days each, joined by 3 leave days.
    for (const s of ["balanced", "extended"] as const) {
      const apart = 2 * breakValue(9, 5, s);
      const joined = breakValue(21, 10, s);
      expect(joined).toBeGreaterThanOrEqual(apart);
    }
    expect(breakValue(21, 10, "long-weekends")).toBeLessThan(
      2 * breakValue(9, 5, "long-weekends"),
    );
  });

  it("values a long break more under extended than under long-weekends", () => {
    const ratio = (s: Strategy) => breakValue(16, 8, s) / breakValue(4, 3, s);
    expect(ratio("extended")).toBeGreaterThan(ratio("balanced"));
    expect(ratio("balanced")).toBeGreaterThan(ratio("long-weekends"));
  });
});

describe("leaveDayCost", () => {
  it("is positive for every strategy", () => {
    for (const s of strategies) expect(leaveDayCost(s)).toBeGreaterThan(0);
  });
});
