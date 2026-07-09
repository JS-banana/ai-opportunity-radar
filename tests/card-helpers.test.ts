import { describe, expect, it } from "vitest";
import { publicSourceChannel, sourceLabel } from "@/components/opportunity/card-helpers";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

function itemWith(sourceChannel: string | null): ActivityOpportunity {
  return { vendor: "OpenAI", sourceChannel } as ActivityOpportunity;
}

describe("publicSourceChannel", () => {
  it("keeps whitelisted platform channels", () => {
    expect(publicSourceChannel(itemWith("Devpost"))).toBe("Devpost");
    expect(publicSourceChannel(itemWith("AgentDeadlines"))).toBe("AgentDeadlines");
    expect(publicSourceChannel(itemWith("官网"))).toBe("官网");
  });

  it("maps internal aliases to public names", () => {
    expect(publicSourceChannel(itemWith("tianchi"))).toBe("天池");
  });

  it("hides internal scan-run labels and placeholders", () => {
    expect(publicSourceChannel(itemWith("DDG_broad"))).toBeNull();
    expect(publicSourceChannel(itemWith("broad_en"))).toBeNull();
    expect(publicSourceChannel(itemWith("web_search"))).toBeNull();
    expect(publicSourceChannel(itemWith("其他"))).toBeNull();
    expect(publicSourceChannel(itemWith(null))).toBeNull();
  });
});

describe("sourceLabel", () => {
  it("falls back to vendor when the channel is internal", () => {
    expect(sourceLabel(itemWith("DDG broad_en"))).toBe("OpenAI");
    expect(sourceLabel(itemWith("lablab.ai"))).toBe("lablab.ai");
  });
});
