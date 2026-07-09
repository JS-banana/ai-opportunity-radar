import { describe, expect, it } from "vitest";
import records from "./fixtures/feishu-records.json";
import type { FeishuRecord } from "@/lib/feishu/types";
import { mapRecordsToOpportunities } from "@/lib/opportunity/mapper";

describe("mapRecordsToOpportunities", () => {
  const result = mapRecordsToOpportunities(records as FeishuRecord[], new Date("2026-07-05T00:00:00.000Z"));

  it("maps valid Feishu records into opportunities", () => {
    expect(result.opportunities).toHaveLength(3);
    const first = result.opportunities[0];
    expect(first.title).toBe("Global AI Build Hackathon");
    expect(first.score).toBe(5);
    expect(first.difficulty).toBe(3);
    expect(first.type).toBe("hackathon");
    expect(first.rewardTypes).toEqual(["cash", "api-credits"]);
    expect(first.registrationUrl).toBe("https://example.com/apply?ref=test");
    expect(first.slug).toBe("global-ai-build-hackathon");
  });

  it("maps live Feishu enum values from snapshot", () => {
    const live = result.opportunities.find((item) => item.id === "rec_live_hackathon");
    expect(live?.type).toBe("hackathon");
    expect(live?.region).toBe("north-america");
    expect(live?.rewardTypes).toEqual(["cash"]);
    expect(live?.officialStatus).toBe("confirmed");
  });

  it("fails soft on unknown enums and malformed score", () => {
    const unknown = result.opportunities.find((item) => item.id === "rec_unknown_enum");
    expect(unknown?.type).toBe("other");
    expect(unknown?.region).toBe("other");
    expect(unknown?.rewardTypes).toEqual(["other"]);
    expect(unknown?.score).toBe(3);
    expect(result.issues.some((issue) => issue.severity === "warn" && issue.recordId === "rec_unknown_enum")).toBe(true);
  });

  it("skips unsafe or owner-skipped records", () => {
    expect(result.skippedCount).toBe(3);
    expect(result.issues.filter((issue) => issue.severity === "skip").map((issue) => issue.recordId)).toEqual([
      "rec_bad_url",
      "rec_skipped",
      "rec_dup_url",
    ]);
  });

  it("keeps the first record when registration URLs collide across sources", () => {
    expect(result.opportunities.some((item) => item.id === "rec_live_hackathon")).toBe(true);
    expect(result.opportunities.some((item) => item.id === "rec_dup_url")).toBe(false);
    const dup = result.issues.find((issue) => issue.recordId === "rec_dup_url" && issue.severity === "skip");
    expect(dup?.reason).toContain("rec_live_hackathon");
  });
});
