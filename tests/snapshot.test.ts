import { describe, expect, it } from "vitest";
import { isImplausiblySmallSnapshot } from "@/lib/snapshot/refresh";
import { seedSnapshot } from "@/lib/snapshot/seed";
import { readSnapshotFromLocalFile } from "@/lib/snapshot/local";

describe("snapshot protection", () => {
  it("blocks implausibly small replacements only below 50 percent", () => {
    const previous = { ...seedSnapshot, recordCount: 10 };
    expect(isImplausiblySmallSnapshot({ ...seedSnapshot, recordCount: 4 }, previous)).toBe(true);
    expect(isImplausiblySmallSnapshot({ ...seedSnapshot, recordCount: 5 }, previous)).toBe(false);
    expect(isImplausiblySmallSnapshot({ ...seedSnapshot, recordCount: 0 }, { ...seedSnapshot, recordCount: 9 })).toBe(false);
  });
});

describe("local snapshot fallback", () => {
  it("loads the dumped Feishu snapshot for dev without credentials", () => {
    const snapshot = readSnapshotFromLocalFile();
    expect(snapshot).not.toBeNull();
    expect(snapshot!.recordCount).toBeGreaterThanOrEqual(50);
    expect(snapshot!.opportunities.length).toBe(snapshot!.recordCount);
  });
});
