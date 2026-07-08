import { fetchBitableFields, fetchBitableRecords } from "@/lib/feishu/client";
import type { FeishuField } from "@/lib/feishu/types";
import { getDeadlineBucket } from "@/lib/opportunity/derive";
import { criticalFeishuFields, mapRecordsToOpportunities, type MapperIssue } from "@/lib/opportunity/mapper";
import type { Snapshot } from "@/lib/opportunity/model";

export type SnapshotBuildResult = {
  snapshot: Snapshot;
  fields: FeishuField[];
  issues: MapperIssue[];
};

export function validateRequiredFields(fields: FeishuField[]) {
  const names = new Set(fields.map((field) => field.field_name));
  const missing = criticalFeishuFields.filter((name) => !names.has(name));
  if (missing.length) {
    throw new Error(`Feishu Base missing required fields: ${missing.join(", ")}`);
  }
}

export function isImplausiblySmallSnapshot(next: Snapshot, previous: Snapshot | null) {
  return Boolean(previous && previous.recordCount >= 10 && next.recordCount < previous.recordCount * 0.5);
}

// 过期记录允许从 Feishu 清理，但要保留在快照里作为归档；
// 未过期却从 Feishu 消失的记录视为被人工删除，不保留。
export function mergeWithArchivedRecords(next: Snapshot, previous: Snapshot | null, now = new Date()): Snapshot {
  if (!previous) return next;
  const freshIds = new Set(next.opportunities.map((item) => item.id));
  const archived = previous.opportunities.filter(
    (item) => !freshIds.has(item.id) && getDeadlineBucket(item.endAt, now) === "expired",
  );
  if (archived.length === 0) return next;
  const opportunities = [...next.opportunities, ...archived];
  return { ...next, opportunities, recordCount: opportunities.length };
}

export async function buildSnapshotFromFeishu(now = new Date()): Promise<SnapshotBuildResult> {
  const fields = await fetchBitableFields();
  validateRequiredFields(fields);

  const records = await fetchBitableRecords();
  if (records.length === 0) {
    throw new Error("Feishu returned zero records; treating as a likely permission or table regression.");
  }

  const mapped = mapRecordsToOpportunities(records, now);
  const snapshot: Snapshot = {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    recordCount: mapped.opportunities.length,
    skippedCount: mapped.skippedCount,
    opportunities: mapped.opportunities,
  };

  return { snapshot, fields, issues: mapped.issues };
}
