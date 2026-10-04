import { describe, it, expect } from "vitest";
import { encodeConfig, decodeConfig } from "@/export/url-encoder";
import { DEFAULT_CONFIG } from "@/engine/types";
import type { AppConfig } from "@/engine/types";

function hashOf(compact: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(compact));
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const full: AppConfig = {
  ...DEFAULT_CONFIG,
  year: 2027,
  country: "GB",
  subdivision: "SCT",
  weekendDays: [5, 6],
  schoolZone: "B",
  ptoBudget: 20,
  recoveryBudget: 3,
  strategy: "extended",
  blackoutDates: ["2027-03-01"],
  preBookedDates: ["2027-04-02"],
  preBookedTypes: { "2027-04-02": "recovery" },
  customHolidays: ["2027-06-07"],
  manualOverrides: { "2027-05-10": "pto", "2027-05-11": null },
  disabledBridges: ["bridge-2027-05-07"],
};

describe("url-encoder", () => {
  it("round-trips every field", () => {
    const decoded = decodeConfig(encodeConfig(full, "fr"));
    expect(decoded?.config).toEqual(full);
    expect(decoded?.language).toBe("fr");
  });

  it("always encodes the year", () => {
    const hash = encodeConfig({ ...DEFAULT_CONFIG });
    expect(decodeConfig(hash)?.config.year).toBe(DEFAULT_CONFIG.year);
    expect(JSON.parse(atob(hash.replace(/-/g, "+").replace(/_/g, "/")))).toHaveProperty("y");
  });

  it("handles characters outside Latin-1", () => {
    const config = { ...DEFAULT_CONFIG, disabledBridges: ["bridge-2026-11-30"] };
    const hash = encodeConfig(config, "fr");
    expect(() => decodeConfig(hash)).not.toThrow();
    // A legacy name with a curly apostrophe must not break encoding.
    expect(() =>
      encodeConfig({ ...DEFAULT_CONFIG, disabledBridges: ["St Andrew’s Day"] }),
    ).not.toThrow();
  });

  it("rejects garbage", () => {
    expect(decodeConfig("!!!")).toBeNull();
    expect(decodeConfig(hashOf([1, 2]))).toBeNull();
    expect(decodeConfig(hashOf("x"))).toBeNull();
  });

  it("replaces invalid fields with defaults", () => {
    const decoded = decodeConfig(
      hashOf({
        y: "x",
        cc: "ZZ",
        wd: "06",
        z: "D",
        c: 1e9,
        t: -3,
        s: "foo",
        b: "2026-05-01",
        p: ["2026-02-30", "2026-05-04"],
        pt: { "2026-05-04": "vacation", "2026-05-05": "pto" },
        mo: { "2026-06-01": "vacation", nope: "pto", "2026-06-02": null },
        db: ["Christmas Day", "bridge-2026-12-28"],
        l: "de",
      }),
    )!;
    const c = decoded.config;
    expect(c.year).toBe(DEFAULT_CONFIG.year);
    expect(c.country).toBe("FR");
    expect(c.weekendDays).toEqual(DEFAULT_CONFIG.weekendDays);
    expect(c.schoolZone).toBe("none");
    expect(c.ptoBudget).toBe(50);
    expect(c.recoveryBudget).toBe(0);
    expect(c.strategy).toBe("balanced");
    expect(c.blackoutDates).toEqual([]);
    expect(c.preBookedDates).toEqual(["2026-05-04"]);
    expect(c.preBookedTypes).toEqual({});
    expect(c.manualOverrides).toEqual({ "2026-06-02": null });
    expect(c.disabledBridges).toEqual(["bridge-2026-12-28"]);
    expect(decoded.language).toBeUndefined();
  });

  it("refuses a week with no workday", () => {
    const decoded = decodeConfig(hashOf({ wd: [0, 1, 2, 3, 4, 5, 6] }))!;
    expect(decoded.config.weekendDays).toEqual(DEFAULT_CONFIG.weekendDays);
  });

  it("uses the default subdivision for non-French countries", () => {
    expect(decodeConfig(hashOf({ cc: "DE" }))!.config.subdivision).toBe("default");
  });
});
