import { z } from "zod";

const feishuEnvSchema = z.object({
  FEISHU_APP_ID: z.string().min(1),
  FEISHU_APP_SECRET: z.string().min(1),
  FEISHU_APP_TOKEN: z.string().min(1),
  FEISHU_TABLE_ID: z.string().min(1).default("tblYhMRh3fJ0FDfW"),
});

const snapshotEnvSchema = z.object({
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  SNAPSHOT_TTL_HOURS: z.coerce.number().positive().default(6),
  LOCAL_SNAPSHOT_PATH: z.string().min(1).optional(),
});

const defaultLocalSnapshotPath = "tmp/snapshot.json";

export type FeishuEnv = z.infer<typeof feishuEnvSchema>;

export function hasFeishuEnv(env = process.env) {
  return feishuEnvSchema.safeParse(env).success;
}

export function getFeishuEnv(env = process.env): FeishuEnv {
  return feishuEnvSchema.parse(env);
}

export function getSnapshotEnv(env = process.env) {
  return snapshotEnvSchema.parse(env);
}

export function getSnapshotTtlMs(env = process.env) {
  return getSnapshotEnv(env).SNAPSHOT_TTL_HOURS * 60 * 60 * 1000;
}

export function getLocalSnapshotPath(env = process.env) {
  const parsed = snapshotEnvSchema.safeParse(env);
  if (parsed.success && parsed.data.LOCAL_SNAPSHOT_PATH) {
    return parsed.data.LOCAL_SNAPSHOT_PATH;
  }
  return defaultLocalSnapshotPath;
}
