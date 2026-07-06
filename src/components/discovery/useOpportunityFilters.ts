"use client";

import { useMemo } from "react";
import type { FilterKey, HeroChipKey } from "@/content/atlas-copy";
import type { ActivityOpportunity } from "@/lib/opportunity/model";
import { getDeadlineBucket } from "@/lib/opportunity/derive";

const newWindowMs = 7 * 24 * 60 * 60 * 1000;

export type OpportunityFilterKey = FilterKey | HeroChipKey;

export function useOpportunityFilters(
  opportunities: ActivityOpportunity[],
  query: string,
  activeFilter: OpportunityFilterKey,
  now = new Date(),
) {
  return useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const current = now.getTime();
    return opportunities.filter((item) => {
      const haystack = `${item.title} ${item.vendor} ${item.rewardSummary ?? ""} ${item.rewardDetail ?? ""}`.toLowerCase();
      if (normalized && !haystack.includes(normalized)) return false;
      if (activeFilter === "new") {
        if (!item.discoveredAt) return false;
        return current - new Date(item.discoveredAt).getTime() <= newWindowMs;
      }
      if (activeFilter === "ending-soon") return ["ending-3d", "ending-7d"].includes(getDeadlineBucket(item.endAt, now));
      if (activeFilter === "hackathon") return item.type === "hackathon" || item.type === "dev-challenge";
      if (activeFilter === "grant") return /grant|research|fund/i.test(`${item.title} ${item.rewardSummary ?? ""} ${item.rewardDetail ?? ""}`);
      if (activeFilter === "api-credits") return item.rewardTypes.includes("api-credits");
      if (activeFilter === "online") return /online/i.test(item.format ?? "");
      if (activeFilter === "prize") return item.rewardTypes.includes("cash");
      return true;
    });
  }, [activeFilter, now, opportunities, query]);
}
