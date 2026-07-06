import { describe, expect, it } from "vitest";
import { getDeadlineBucket, getPublicStatus, makeSlug, sortOpportunities } from "@/lib/opportunity/derive";
import { seedSnapshot } from "@/lib/snapshot/seed";

describe("deadline derivation", () => {
  const now = new Date("2026-07-05T00:00:00.000Z");

  it("handles all deadline buckets", () => {
    expect(getDeadlineBucket("2026-07-04T23:59:59.000Z", now)).toBe("expired");
    expect(getDeadlineBucket("2026-07-08T00:00:00.000Z", now)).toBe("ending-3d");
    expect(getDeadlineBucket("2026-07-12T00:00:00.000Z", now)).toBe("ending-7d");
    expect(getDeadlineBucket("2026-07-13T00:00:00.000Z", now)).toBe("ongoing");
    expect(getDeadlineBucket(null, now)).toBe("long-term");
  });

  it("derives public status without internal Base states", () => {
    expect(getPublicStatus("2026-07-08T00:00:00.000Z", now)).toBe("ending-soon");
    expect(getPublicStatus(null, now)).toBe("long-term");
  });
});

describe("slug and sorting", () => {
  it("creates readable slugs and handles pure Chinese titles", () => {
    expect(makeSlug("OpenAI API Build Event!!")).toBe("openai-api-build-event");
    expect(makeSlug("纯中文标题")).toBeNull();
    expect(makeSlug("Very Long ".repeat(20))?.length).toBeLessThanOrEqual(80);
  });

  it("sorts non-expired high score records first", () => {
    const sorted = sortOpportunities(seedSnapshot.opportunities, new Date("2026-07-05T00:00:00.000Z"));
    expect(sorted[0].score).toBeGreaterThanOrEqual(sorted[1].score);
    expect(sorted.at(-1)?.title).not.toBe("");
  });
});
