import { getDeadlineBucket, sortOpportunities } from "@/lib/opportunity/derive";
import type { ActivityOpportunity } from "@/lib/opportunity/model";
import { getSnapshot, type SnapshotResult } from "@/lib/snapshot/get";

export type ActiveOpportunitiesResult = SnapshotResult & {
  opportunities: ActivityOpportunity[];
};

export async function getActiveOpportunities(): Promise<ActiveOpportunitiesResult> {
  const result = await getSnapshot();
  const opportunities = sortOpportunities(result.snapshot.opportunities).filter(
    (item) => getDeadlineBucket(item.endAt) !== "expired",
  );
  return { ...result, opportunities };
}
