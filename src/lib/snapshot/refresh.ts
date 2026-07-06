import { fetchBitableFields, fetchBitableRecords } from "@/lib/feishu/client";
import type { FeishuField } from "@/lib/feishu/types";
import { criticalFeishuFields, mapRecordsToOpportunities, type MapperIssue } from "@/lib/opportunity/mapper";
import type { Snapshot } from "@/lib/opportunity/model";
import { writeSnapshotToBlob } from "./store";

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

export async function refreshSnapshot(previous: Snapshot | null = null, now = new Date()) {
  const result = await buildSnapshotFromFeishu(now);
  if (isImplausiblySmallSnapshot(result.snapshot, previous)) {
    throw new Error(`Refusing to overwrite snapshot: ${result.snapshot.recordCount} records vs previous ${previous?.recordCount}.`);
  }
  await writeSnapshotToBlob(result.snapshot);
  return result;
}
