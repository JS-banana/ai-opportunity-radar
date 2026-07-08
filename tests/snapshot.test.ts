import { describe, expect, it } from "vitest";
import { isImplausiblySmallSnapshot, mergeWithArchivedRecords } from "@/lib/snapshot/refresh";
import { seedSnapshot } from "./fixtures/seed";

describe("snapshot protection", () => {
  it("blocks implausibly small replacements only below 50 percent", () => {
    const previous = { ...seedSnapshot, recordCount: 10 };
    expect(isImplausiblySmallSnapshot({ ...seedSnapshot, recordCount: 4 }, previous)).toBe(true);
    expect(isImplausiblySmallSnapshot({ ...seedSnapshot, recordCount: 5 }, previous)).toBe(false);
    expect(isImplausiblySmallSnapshot({ ...seedSnapshot, recordCount: 0 }, { ...seedSnapshot, recordCount: 9 })).toBe(false);
  });
});

describe("archived record merge", () => {
  const now = new Date("2026-07-05T00:00:00.000Z");
  const [first, ...rest] = seedSnapshot.opportunities;
  const expiredMissing = { ...first, id: "rec_expired_gone", endAt: "2026-06-01T00:00:00.000Z" };
  const activeMissing = { ...first, id: "rec_active_gone", endAt: "2026-08-01T00:00:00.000Z" };

  it("keeps expired records that were removed from Feishu", () => {
    const previous = {
      ...seedSnapshot,
      opportunities: [expiredMissing, ...rest],
      recordCount: rest.length + 1,
    };
    const next = { ...seedSnapshot, opportunities: rest, recordCount: rest.length };
    const merged = mergeWithArchivedRecords(next, previous, now);
    expect(merged.recordCount).toBe(rest.length + 1);
    expect(merged.opportunities.some((item) => item.id === "rec_expired_gone")).toBe(true);
  });

  it("drops non-expired records that were removed from Feishu", () => {
    const previous = {
      ...seedSnapshot,
      opportunities: [activeMissing, ...rest],
      recordCount: rest.length + 1,
    };
    const next = { ...seedSnapshot, opportunities: rest, recordCount: rest.length };
    const merged = mergeWithArchivedRecords(next, previous, now);
    expect(merged.recordCount).toBe(rest.length);
    expect(merged.opportunities.some((item) => item.id === "rec_active_gone")).toBe(false);
  });

  it("prefers the fresh Feishu version when a record exists in both", () => {
    const previousVersion = { ...first, title: "old title" };
    const previous = { ...seedSnapshot, opportunities: [previousVersion, ...rest] };
    const merged = mergeWithArchivedRecords(seedSnapshot, previous, now);
    expect(merged.opportunities.find((item) => item.id === first.id)?.title).toBe(first.title);
    expect(merged.recordCount).toBe(seedSnapshot.recordCount);
  });

  it("returns the fresh snapshot unchanged without a previous snapshot", () => {
    expect(mergeWithArchivedRecords(seedSnapshot, null, now)).toBe(seedSnapshot);
  });
});
