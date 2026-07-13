import type { FeishuRecord } from "@/lib/feishu/types";
import {
  normalizeOfficialStatus,
  normalizeOpportunityType,
  normalizeRegion,
  normalizeRewardType,
  normalizeSuggestion,
  parseDifficulty,
} from "./enums";
import { makeSlug } from "./derive";
import { ActivityOpportunitySchema, type ActivityOpportunity } from "./model";
import { normalizePublicSourceChannel } from "./source-channel";

export type MapperIssue = {
  recordId: string;
  field?: string;
  reason: string;
  severity: "skip" | "warn";
};

export type MapperResult = {
  opportunities: ActivityOpportunity[];
  skippedCount: number;
  issues: MapperIssue[];
};

const fields = {
  title: "活动名称",
  vendor: "厂商",
  type: "活动类型",
  score: "推荐指数",
  difficulty: "难度评级",
  difficultyNote: "难度说明",
  rewardDetail: "奖励详情",
  rewardTypes: "奖励类型",
  format: "活动形式",
  participation: "参与方式",
  winningCriteria: "获奖条件",
  timelineNotes: "时间节点备注",
  startAt: "开始时间",
  endAt: "截止时间",
  region: "地区",
  officialStatus: "官方确认",
  registrationUrl: "报名入口",
  sourceChannel: "来源渠道",
  estimatedEffort: "预计投入",
  suggestion: "建议",
  discoveredAt: "发现日期",
  status: "状态",
} as const;

export const criticalFeishuFields = [fields.title, fields.registrationUrl, fields.endAt] as const;

export function mapRecordsToOpportunities(records: FeishuRecord[], now = new Date()): MapperResult {
  const issues: MapperIssue[] = [];
  const opportunities: ActivityOpportunity[] = [];
  const seenUrls = new Map<string, string>();

  for (const record of records) {
    const mapped = mapRecord(record, issues, now);
    if (!mapped) continue;
    // Cross-aggregator duplicates land as separate Base records pointing at the same entry URL.
    const key = registrationUrlKey(mapped.registrationUrl);
    const firstId = seenUrls.get(key);
    if (firstId) {
      issues.push({
        recordId: record.record_id,
        field: fields.registrationUrl,
        reason: `duplicate registration URL of ${firstId}`,
        severity: "skip",
      });
      continue;
    }
    seenUrls.set(key, mapped.id);
    opportunities.push(mapped);
  }

  return {
    opportunities,
    skippedCount: issues.filter((issue) => issue.severity === "skip").length,
    issues,
  };
}

function mapRecord(record: FeishuRecord, issues: MapperIssue[], now: Date): ActivityOpportunity | null {
  const rawStatus = text(record.fields[fields.status]);
  if (rawStatus?.includes("已跳过")) {
    issues.push({ recordId: record.record_id, field: fields.status, reason: "status skipped", severity: "skip" });
    return null;
  }

  const title = text(record.fields[fields.title]);
  if (!title) {
    issues.push({ recordId: record.record_id, field: fields.title, reason: "missing title", severity: "skip" });
    return null;
  }

  const registrationUrl = url(record.fields[fields.registrationUrl]);
  if (!registrationUrl) {
    issues.push({ recordId: record.record_id, field: fields.registrationUrl, reason: "missing or invalid registration URL", severity: "skip" });
    return null;
  }

  const rewardDetail = text(record.fields[fields.rewardDetail]);
  const rewardTypes = list(record.fields[fields.rewardTypes]).map(normalizeRewardType);
  const score = parseScore(text(record.fields[fields.score]), record.record_id, issues);
  const discoveredAt = date(record.fields[fields.discoveredAt]) ?? date(record.created_time) ?? now.toISOString();

  const opportunity: ActivityOpportunity = {
    id: record.record_id,
    title,
    vendor: text(record.fields[fields.vendor]) ?? "Unknown",
    type: normalizeOpportunityType(text(record.fields[fields.type])),
    score,
    difficulty: parseDifficulty(text(record.fields[fields.difficulty])),
    difficultyNote: text(record.fields[fields.difficultyNote]),
    rewardSummary: summary(rewardDetail),
    rewardDetail,
    rewardTypes: rewardTypes.length ? [...new Set(rewardTypes)] : ["other"],
    format: text(record.fields[fields.format]),
    participation: text(record.fields[fields.participation]),
    winningCriteria: text(record.fields[fields.winningCriteria]),
    timelineNotes: text(record.fields[fields.timelineNotes]),
    startAt: date(record.fields[fields.startAt]),
    endAt: date(record.fields[fields.endAt]),
    region: normalizeRegion(text(record.fields[fields.region])),
    officialStatus: normalizeOfficialStatus(text(record.fields[fields.officialStatus])),
    registrationUrl,
    sourceChannel: normalizePublicSourceChannel(text(record.fields[fields.sourceChannel])),
    estimatedEffort: text(record.fields[fields.estimatedEffort]),
    suggestion: normalizeSuggestion(text(record.fields[fields.suggestion])),
    discoveredAt,
    slug: makeSlug(title),
  };

  const parsed = ActivityOpportunitySchema.safeParse(opportunity);
  if (!parsed.success) {
    issues.push({ recordId: record.record_id, reason: parsed.error.issues.map((item) => item.message).join("; "), severity: "skip" });
    return null;
  }

  return parsed.data;
}

function parseScore(value: string | null, recordId: string, issues: MapperIssue[]): 1 | 2 | 3 | 4 | 5 {
  const stars = (value?.match(/[★⭐]/g) ?? []).length;
  const digit = value ? Number(value.match(/[1-5]/)?.[0]) : 0;
  const score = stars || digit;
  if (score >= 1 && score <= 5) return score as 1 | 2 | 3 | 4 | 5;
  issues.push({ recordId, field: fields.score, reason: "invalid score, defaulted to 3", severity: "warn" });
  return 3;
}

function registrationUrlKey(value: string) {
  const parsed = new URL(value);
  return `${parsed.host.toLowerCase()}${parsed.pathname.replace(/\/+$/, "")}${parsed.search}`;
}

function summary(value: string | null) {
  if (!value) return null;
  return value.split(/\n+/)[0]?.trim().slice(0, 80) || null;
}

function url(value: unknown): string | null {
  const candidates = urlCandidates(value);
  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.toString();
    } catch {
      // ignore malformed candidate
    }
  }
  return null;
}

function urlCandidates(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(urlCandidates);
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    return [object.url, object.link, object.href, object.text, object.value].flatMap(urlCandidates);
  }
  return [];
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(text).filter(Boolean) as string[];
  const single = text(value);
  return single ? single.split(/[、,，;；/]/).map((item) => item.trim()).filter(Boolean) : [];
}

function date(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return new Date(value).toISOString();
  const raw = text(value);
  if (!raw) return null;
  const numeric = Number(raw);
  const parsed = Number.isFinite(numeric) && numeric > 1000000000 ? new Date(numeric) : new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function text(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim() || null;
  }
  if (Array.isArray(value)) {
    const joined = value.map(text).filter(Boolean).join(" ").trim();
    return joined || null;
  }
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    for (const key of ["text", "name", "value", "link", "url"]) {
      const result = text(object[key]);
      if (result) return result;
    }
  }
  return null;
}
