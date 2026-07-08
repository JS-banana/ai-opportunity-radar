import { existsSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { writeFile } from "node:fs/promises";
import { SnapshotSchema, type Snapshot } from "../src/lib/opportunity/model";
import { buildSnapshotFromFeishu, isImplausiblySmallSnapshot, mergeWithArchivedRecords } from "../src/lib/snapshot/refresh";

loadDotEnv(".env");

const snapshotPath = "src/data/snapshot.json";

async function main() {
  const previous = readPreviousSnapshot();
  const now = new Date();
  const result = await buildSnapshotFromFeishu(now);
  const snapshot = mergeWithArchivedRecords(result.snapshot, previous, now);

  if (isImplausiblySmallSnapshot(snapshot, previous)) {
    throw new Error(
      `Refusing to overwrite snapshot: ${snapshot.recordCount} records vs previous ${previous?.recordCount}.`,
    );
  }

  const json = JSON.stringify(snapshot, null, 2);
  const rawBytes = Buffer.byteLength(json);
  const gzipBytes = gzipSync(json).byteLength;
  const skipped = result.issues.filter((issue) => issue.severity === "skip");
  const archivedCount = snapshot.recordCount - result.snapshot.recordCount;

  await writeFile(snapshotPath, `${json}\n`);
  console.error(`wrote: ${snapshotPath}`);

  console.error("\nSnapshot report");
  console.error(`fields: ${result.fields.length}`);
  console.error(`records: ${snapshot.recordCount} (feishu: ${result.snapshot.recordCount}, archived-only: ${archivedCount})`);
  console.error(`skipped: ${snapshot.skippedCount}`);
  console.error(`json: ${rawBytes} bytes`);
  console.error(`gzip: ${gzipBytes} bytes`);
  if (rawBytes > 500_000) {
    console.error("WARNING: snapshot is over 500KB before gzip; reassess full client-side delivery.");
  }
  if (skipped.length) {
    console.error("skip reasons:");
    for (const issue of skipped) {
      console.error(`- ${issue.recordId}${issue.field ? ` ${issue.field}` : ""}: ${issue.reason}`);
    }
  }
}

function readPreviousSnapshot(): Snapshot | null {
  if (!existsSync(snapshotPath)) return null;
  try {
    return SnapshotSchema.parse(JSON.parse(readFileSync(snapshotPath, "utf8")));
  } catch (error) {
    console.error(`Previous snapshot at ${snapshotPath} is invalid; syncing without merge.`, error);
    return null;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

function loadDotEnv(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}
