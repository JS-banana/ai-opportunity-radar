import { describe, expect, it } from "vitest";
import { normalizeOpportunityType, normalizeRegion, normalizeRewardType } from "@/lib/opportunity/enums";

describe("live enum normalization", () => {
  it("maps Feishu activity types seen in production Base", () => {
    expect(normalizeOpportunityType("Hackathon")).toBe("hackathon");
    expect(normalizeOpportunityType("开发者挑战赛")).toBe("dev-challenge");
    expect(normalizeOpportunityType("福利发放")).toBe("benefit");
    expect(normalizeOpportunityType("AI竞赛")).toBe("ai-competition");
    expect(normalizeOpportunityType("内测体验")).toBe("beta-access");
  });

  it("maps Feishu reward types seen in production Base", () => {
    expect(normalizeRewardType("API Credits")).toBe("api-credits");
    expect(normalizeRewardType("现金")).toBe("cash");
    expect(normalizeRewardType("会员权益")).toBe("membership");
  });

  it("maps Feishu regions seen in production Base", () => {
    expect(normalizeRegion("美国")).toBe("north-america");
    expect(normalizeRegion("中国")).toBe("china");
    expect(normalizeRegion("全球")).toBe("global");
  });
});
