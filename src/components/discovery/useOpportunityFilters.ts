"use client";

import { useMemo } from "react";
import type { FilterKey } from "@/content/atlas-copy";
import type { ActivityOpportunity } from "@/lib/opportunity/model";
import { getDeadlineBucket } from "@/lib/opportunity/derive";

export function useOpportunityFilters(opportunities: ActivityOpportunity[], query: string, activeFilter: FilterKey) {
  return useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return opportunities.filter((item) => {
      const haystack = `${item.title} ${item.vendor} ${item.rewardSummary ?? ""} ${item.rewardDetail ?? ""}`.toLowerCase();
      if (normalized && !haystack.includes(normalized)) return false;
      if (activeFilter === "ending-soon") return ["ending-3d", "ending-7d"].includes(getDeadlineBucket(item.endAt));
      if (activeFilter === "hackathon") return item.type === "hackathon" || item.type === "dev-challenge";
      if (activeFilter === "grant") return /grant|research|fund/i.test(`${item.title} ${item.rewardSummary ?? ""} ${item.rewardDetail ?? ""}`);
      if (activeFilter === "api-credits") return item.rewardTypes.includes("api-credits");
      if (activeFilter === "online") return /online/i.test(item.format ?? "");
      if (activeFilter === "prize") return item.rewardTypes.includes("cash");
      return true;
    });
  }, [activeFilter, opportunities, query]);
}
