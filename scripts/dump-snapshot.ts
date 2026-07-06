import { existsSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { writeFile } from "node:fs/promises";
import { buildSnapshotFromFeishu } from "../src/lib/snapshot/refresh";

loadDotEnv(".env");

const outIndex = process.argv.indexOf("--out");
const outPath = outIndex >= 0 ? process.argv[outIndex + 1] : null;

async function main() {
  const result = await buildSnapshotFromFeishu(new Date());
  const json = JSON.stringify(result.snapshot, null, 2);
  const rawBytes = Buffer.byteLength(json);
  const gzipBytes = gzipSync(json).byteLength;
  const skipped = result.issues.filter((issue) => issue.severity === "skip");

  if (outPath) {
    await writeFile(outPath, json);
  } else {
    process.stdout.write(`${json}\n`);
  }

  console.error("\nSnapshot report");
  console.error(`fields: ${result.fields.length}`);
  console.error(`records: ${result.snapshot.recordCount}`);
  console.error(`skipped: ${result.snapshot.skippedCount}`);
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
