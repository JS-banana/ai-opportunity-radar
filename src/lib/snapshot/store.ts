import { get, put } from "@vercel/blob";
import { getSnapshotEnv } from "@/lib/env";
import { SnapshotSchema, type Snapshot } from "@/lib/opportunity/model";

export const snapshotPath = "snapshots/latest.json";

export async function readSnapshotFromBlob(): Promise<Snapshot | null> {
  const token = getSnapshotEnv().BLOB_READ_WRITE_TOKEN;
  if (!token) return null;

  try {
    const result = await get(snapshotPath, { access: "public", token });
    if (!result || result.statusCode !== 200) return null;
    const text = await new Response(result.stream).text();
    return SnapshotSchema.parse(JSON.parse(text));
  } catch (error) {
    console.error("Failed to read snapshot blob", error);
    return null;
  }
}

export async function writeSnapshotToBlob(snapshot: Snapshot) {
  const token = getSnapshotEnv().BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.warn("BLOB_READ_WRITE_TOKEN is missing; fresh snapshot was not persisted.");
    return false;
  }

  await put(snapshotPath, JSON.stringify(snapshot), {
    access: "public",
    token,
    contentType: "application/json",
    allowOverwrite: true,
    cacheControlMaxAge: 300,
  });
  return true;
}
