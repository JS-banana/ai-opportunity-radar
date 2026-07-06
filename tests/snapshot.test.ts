import { describe, expect, it } from "vitest";
import { isImplausiblySmallSnapshot } from "@/lib/snapshot/refresh";
import { seedSnapshot } from "@/lib/snapshot/seed";

describe("snapshot protection", () => {
  it("blocks implausibly small replacements only below 50 percent", () => {
    const previous = { ...seedSnapshot, recordCount: 10 };
    expect(isImplausiblySmallSnapshot({ ...seedSnapshot, recordCount: 4 }, previous)).toBe(true);
    expect(isImplausiblySmallSnapshot({ ...seedSnapshot, recordCount: 5 }, previous)).toBe(false);
    expect(isImplausiblySmallSnapshot({ ...seedSnapshot, recordCount: 0 }, { ...seedSnapshot, recordCount: 9 })).toBe(false);
  });
});
