import snapshotData from "@/data/snapshot.json";
import { SnapshotSchema, type Snapshot } from "@/lib/opportunity/model";

// 同步 workflow 每天跑两次；超过 24 小时说明同步链路断了。
const staleAfterMs = 24 * 60 * 60 * 1000;

const bundledSnapshot: Snapshot = SnapshotSchema.parse(snapshotData);

export type SnapshotResult = {
  snapshot: Snapshot;
  isStale: boolean;
};

export async function getSnapshot(now = new Date()): Promise<SnapshotResult> {
  const age = now.getTime() - new Date(bundledSnapshot.generatedAt).getTime();
  return { snapshot: bundledSnapshot, isStale: age > staleAfterMs };
}
