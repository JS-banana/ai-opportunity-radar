import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { detailPath, getDeadlineBucket, sortOpportunities } from "@/lib/opportunity/derive";
import { registrationUrlFor } from "@/lib/opportunity/outbound";
import { SnapshotSchema } from "@/lib/opportunity/model";

const snapshotPath = "src/data/snapshot.json";

describe("bundled snapshot integration", () => {
  const snapshot = SnapshotSchema.parse(JSON.parse(readFileSync(snapshotPath, "utf8")));

  it("matches the snapshot contract", () => {
    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.recordCount).toBe(snapshot.opportunities.length);
    // Skips are explainable (cross-source duplicates, owner-skipped records) but must stay a minority.
    expect(snapshot.skippedCount).toBeLessThan(snapshot.recordCount * 0.5);
    expect(snapshot.opportunities.length).toBeGreaterThanOrEqual(50);
  });

  it("keeps registration URLs unique across records", () => {
    const keys = snapshot.opportunities.map((item) => {
      const url = new URL(item.registrationUrl);
      return `${url.host.toLowerCase()}${url.pathname.replace(/\/+$/, "")}${url.search}`;
    });
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("resolves outbound URLs only by record id", () => {
    for (const item of snapshot.opportunities) {
      expect(registrationUrlFor(snapshot, item.id)).toBe(item.registrationUrl);
      expect(registrationUrlFor(snapshot, "https://evil.example")).toBeNull();
    }
  });

  it("builds locale detail paths for every record", () => {
    for (const item of snapshot.opportunities) {
      expect(detailPath("zh", item)).toMatch(new RegExp(`^/zh/o/${item.id}`));
      expect(detailPath("en", item)).toMatch(new RegExp(`^/en/o/${item.id}`));
    }
  });

  it("separates active listings from expired records", () => {
    const active = snapshot.opportunities.filter((item) => getDeadlineBucket(item.endAt) !== "expired");
    const expired = snapshot.opportunities.length - active.length;
    expect(active.length).toBeGreaterThan(0);
    expect(expired).toBeGreaterThanOrEqual(0);
    expect(active.length + expired).toBe(snapshot.opportunities.length);
  });

  it("sorts the full dataset without data errors", () => {
    expect(sortOpportunities(snapshot.opportunities)).toHaveLength(snapshot.opportunities.length);
  });
});
