import { describe, it, expect } from "vitest";
import { fr, enUS } from "date-fns/locale";
import { formatShortDate, formatFullDate } from "@/lib/format-date";

describe("format-date", () => {
  it("capitalizes French months with accents correctly", () => {
    expect(formatShortDate(new Date(2026, 1, 3), fr, "fr")).toBe("3 Févr.");
    expect(formatShortDate(new Date(2026, 7, 3), fr, "fr")).toBe("3 Août");
    expect(formatFullDate(new Date(2026, 11, 3), fr, "fr")).toBe("3 Déc. 2026");
  });

  it("keeps English dates unchanged", () => {
    expect(formatFullDate(new Date(2026, 4, 14), enUS, "en")).toBe("May 14, 2026");
  });
});
