import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getLocalSnapshotPath } from "@/lib/env";
import { SnapshotSchema, type Snapshot } from "@/lib/opportunity/model";

export function readSnapshotFromLocalFile(): Snapshot | null {
  const configured = getLocalSnapshotPath();
  if (!configured) return null;

  const path = resolve(process.cwd(), configured);
  if (!existsSync(path)) return null;

  try {
    const snapshot = SnapshotSchema.parse(JSON.parse(readFileSync(path, "utf8")));
    if (snapshot.opportunities.length === 0) return null;
    return snapshot;
  } catch (error) {
    console.error(`Failed to read local snapshot at ${path}`, error);
    return null;
  }
}
