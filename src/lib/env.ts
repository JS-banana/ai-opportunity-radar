import { z } from "zod";

const feishuEnvSchema = z.object({
  FEISHU_APP_ID: z.string().min(1),
  FEISHU_APP_SECRET: z.string().min(1),
  FEISHU_APP_TOKEN: z.string().min(1),
  FEISHU_TABLE_ID: z.string().min(1).default("tblYhMRh3fJ0FDfW"),
});

export type FeishuEnv = z.infer<typeof feishuEnvSchema>;

export function getFeishuEnv(env = process.env): FeishuEnv {
  return feishuEnvSchema.parse(env);
}
