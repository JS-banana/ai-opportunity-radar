import { after } from "next/server";
import { hasFeishuEnv, getSnapshotTtlMs } from "@/lib/env";
import type { Snapshot } from "@/lib/opportunity/model";
import { seedSnapshot } from "./seed";
import { refreshSnapshot } from "./refresh";
import { readSnapshotFromBlob } from "./store";

export type SnapshotResult = {
  snapshot: Snapshot;
  isStale: boolean;
  source: "memory" | "blob" | "feishu" | "seed";
};

let memory: { snapshot: Snapshot; expiresAt: number } | null = null;
let refreshInFlight: Promise<unknown> | null = null;

export async function getSnapshot(now = new Date()): Promise<SnapshotResult> {
  const nowMs = now.getTime();
  const ttlMs = getSnapshotTtlMs();

  if (memory && memory.expiresAt > nowMs) {
    return { snapshot: memory.snapshot, isStale: false, source: "memory" };
  }

  const blobSnapshot = await readSnapshotFromBlob();
  if (blobSnapshot) {
    const isStale = Date.now() - new Date(blobSnapshot.generatedAt).getTime() > ttlMs;
    memory = { snapshot: blobSnapshot, expiresAt: nowMs + ttlMs };
    if (isStale && hasFeishuEnv()) scheduleRefresh(blobSnapshot);
    return { snapshot: blobSnapshot, isStale, source: "blob" };
  }

  if (!hasFeishuEnv()) {
    return { snapshot: seedSnapshot, isStale: true, source: "seed" };
  }

  const result = await refreshSnapshot(null, now);
  memory = { snapshot: result.snapshot, expiresAt: nowMs + ttlMs };
  return { snapshot: result.snapshot, isStale: false, source: "feishu" };
}

function scheduleRefresh(previous: Snapshot) {
  if (refreshInFlight) return;
  after(() => {
    refreshInFlight = refreshSnapshot(previous)
      .catch((error) => console.error("Background snapshot refresh failed", error))
      .finally(() => {
        refreshInFlight = null;
      });
  });
}
