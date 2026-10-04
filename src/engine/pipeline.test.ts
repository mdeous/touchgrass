import { describe, it, expect } from "vitest";
import { format, addDays } from "date-fns";
import { runPipeline } from "@/engine/pipeline";
import { getHolidaysForYear } from "@/data/france/holidays";
import { DEFAULT_CONFIG } from "@/engine/types";
import type { AppConfig } from "@/engine/types";

const holidays = [2025, 2026, 2027].flatMap((y) =>
  getHolidaysForYear(y, "metropolitan"),
);
const jan1 = new Date(2026, 0, 1);

function run(overrides: Partial<AppConfig> = {}, today = jan1) {
  return runPipeline({ ...DEFAULT_CONFIG, year: 2026, ...overrides }, holidays, today);
}

const leaveKeys = (output: ReturnType<typeof run>) =>
  output.result.allocations.map((a) => format(a.date, "yyyy-MM-dd"));

describe("runPipeline", () => {
  it("counts each day off once", () => {
    const { result } = run({ strategy: "extended" });
    const days = new Set<string>();
    for (const b of result.selectedBridges) {
      for (let d = b.startDate; d <= b.endDate; d = addDays(d, 1)) {
        days.add(format(d, "yyyy-MM-dd"));
      }
    }
    expect(result.totalDaysOff).toBe(days.size);
  });

  it("returns only days of the selected year in the calendar", () => {
    const { calendar } = run();
    expect(calendar).toHaveLength(365);
    expect(calendar[0].dateKey).toBe("2026-01-01");
  });

  it("deducts pre-booked days from the budget", () => {
    const preBooked = ["2026-03-16", "2026-03-17", "2026-03-18"];
    const { result } = run({
      ptoBudget: 5,
      recoveryBudget: 0,
      preBookedDates: preBooked,
      preBookedTypes: Object.fromEntries(preBooked.map((d) => [d, "pto"])),
    });
    expect(result.ptoUsed).toBeLessThanOrEqual(5);
    const keys = result.allocations.map((a) => format(a.date, "yyyy-MM-dd"));
    for (const d of preBooked) expect(keys).toContain(d);
  });

  it("does not count a pre-booked weekend day as leave", () => {
    const { result } = run({
      preBookedDates: ["2026-03-14"],
      preBookedTypes: { "2026-03-14": "pto" },
    });
    expect(
      result.allocations.some((a) => format(a.date, "yyyy-MM-dd") === "2026-03-14"),
    ).toBe(false);
  });

  it("counts manual leave days in the totals", () => {
    const base = run({ ptoBudget: 0, recoveryBudget: 0 });
    const withManual = run({
      ptoBudget: 1,
      recoveryBudget: 0,
      manualOverrides: { "2026-06-10": "pto" },
    });
    expect(base.result.ptoUsed).toBe(0);
    expect(withManual.result.ptoUsed).toBe(1);
    expect(withManual.calendar.find((d) => d.dateKey === "2026-06-10")!.type).toBe("pto");
  });

  it("never places leave on a day forced back to work", () => {
    const before = run();
    expect(leaveKeys(before)).toContain("2026-12-28");
    const after = run({ manualOverrides: { "2026-12-28": null } });
    expect(leaveKeys(after)).not.toContain("2026-12-28");
  });

  it("disables a candidate bridge by id without touching its namesake", () => {
    const { candidates } = run();
    const armistice = candidates.filter((b) => b.pontName === "Armistice Day");
    expect(armistice).toHaveLength(2);
    const output = run({ disabledBridges: [armistice[0].id] });
    for (const day of armistice[0].days) {
      expect(leaveKeys(output)).not.toContain(format(day, "yyyy-MM-dd"));
    }
  });

  it("skips past days in the current year", () => {
    const output = run({}, new Date(2026, 6, 1));
    for (const day of leaveKeys(output)) {
      expect(day >= "2026-07-01").toBe(true);
    }
  });
});
