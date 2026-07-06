import { getFeishuEnv, type FeishuEnv } from "@/lib/env";
import type { FeishuField, FeishuListResponse, FeishuRecord } from "./types";

const baseUrl = "https://open.feishu.cn/open-apis";
const tokenEarlyExpiryMs = 5 * 60 * 1000;

let tokenCache: { token: string; expiresAt: number } | null = null;

async function fetchJson<T>(url: string, init: RequestInit, retry = true): Promise<T> {
  const response = await fetch(url, init);
  if (retry && (response.status === 429 || response.status >= 500)) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return fetchJson<T>(url, init, false);
  }
  if (!response.ok) {
    throw new Error(`Feishu request failed: ${response.status} ${response.statusText}`);
  }
  const json = (await response.json()) as T & { code?: number; msg?: string };
  if (typeof json.code === "number" && json.code !== 0) {
    throw new Error(`Feishu API error ${json.code}: ${json.msg ?? "unknown"}`);
  }
  return json;
}

export async function getTenantAccessToken(env: FeishuEnv = getFeishuEnv()) {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) return tokenCache.token;

  const json = await fetchJson<{ tenant_access_token: string; expire: number }>(
    `${baseUrl}/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ app_id: env.FEISHU_APP_ID, app_secret: env.FEISHU_APP_SECRET }),
    },
  );

  tokenCache = {
    token: json.tenant_access_token,
    expiresAt: now + json.expire * 1000 - tokenEarlyExpiryMs,
  };
  return tokenCache.token;
}

export async function fetchBitableFields(env: FeishuEnv = getFeishuEnv()) {
  const token = await getTenantAccessToken(env);
  const fields: FeishuField[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ page_size: "100" });
    if (pageToken) params.set("page_token", pageToken);
    const json = await fetchJson<FeishuListResponse<FeishuField>>(
      `${baseUrl}/bitable/v1/apps/${env.FEISHU_APP_TOKEN}/tables/${env.FEISHU_TABLE_ID}/fields?${params}`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    fields.push(...(json.data?.items ?? []));
    pageToken = json.data?.has_more ? json.data.page_token : undefined;
  } while (pageToken);

  return fields;
}

export async function fetchBitableRecords(env: FeishuEnv = getFeishuEnv()) {
  const token = await getTenantAccessToken(env);
  const records: FeishuRecord[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ page_size: "500" });
    if (pageToken) params.set("page_token", pageToken);
    const json = await fetchJson<FeishuListResponse<FeishuRecord>>(
      `${baseUrl}/bitable/v1/apps/${env.FEISHU_APP_TOKEN}/tables/${env.FEISHU_TABLE_ID}/records/search?${params}`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ automatic_fields: false }),
      },
    );
    records.push(...(json.data?.items ?? []));
    pageToken = json.data?.has_more ? json.data.page_token : undefined;
  } while (pageToken);

  return records;
}
