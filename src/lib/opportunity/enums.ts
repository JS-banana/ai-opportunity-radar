import type { Locale } from "@/i18n/locales";

export const opportunityTypes = [
  "hackathon",
  "dev-challenge",
  "dev-incentive",
  "ai-competition",
  "beta-access",
  "benefit",
  "content-creation",
  "other",
] as const;

export const rewardTypes = ["cash", "api-credits", "membership", "physical", "certificate", "other"] as const;
export const regions = ["global", "china", "north-america", "apac", "europe", "japan", "other"] as const;
export const officialStatuses = ["confirmed", "suspected", "unofficial"] as const;
export const suggestions = ["act-now", "worth-doing", "watch", "skip"] as const;

export type OpportunityType = (typeof opportunityTypes)[number];
export type RewardType = (typeof rewardTypes)[number];
export type Region = (typeof regions)[number];
export type OfficialStatus = (typeof officialStatuses)[number];
export type Suggestion = (typeof suggestions)[number];
export type Difficulty = 1 | 2 | 3 | 4 | 5;

type LabelMap<T extends string> = Record<T, Record<Locale, string>>;

const typeLabels: LabelMap<OpportunityType> = {
  hackathon: { zh: "黑客松", en: "Hackathon" },
  "dev-challenge": { zh: "开发挑战", en: "Developer challenge" },
  "dev-incentive": { zh: "开发激励", en: "Developer incentive" },
  "ai-competition": { zh: "AI 竞赛", en: "AI competition" },
  "beta-access": { zh: "内测资格", en: "Beta access" },
  benefit: { zh: "权益福利", en: "Benefit" },
  "content-creation": { zh: "内容创作", en: "Content creation" },
  other: { zh: "其他", en: "Other" },
};

const rewardLabels: LabelMap<RewardType> = {
  cash: { zh: "奖金", en: "Cash" },
  "api-credits": { zh: "API 积分", en: "API credits" },
  membership: { zh: "会员权益", en: "Membership" },
  physical: { zh: "实物", en: "Physical prize" },
  certificate: { zh: "证书", en: "Certificate" },
  other: { zh: "其他", en: "Other" },
};

const regionLabels: LabelMap<Region> = {
  global: { zh: "全球", en: "Global" },
  china: { zh: "中国", en: "China" },
  "north-america": { zh: "北美", en: "North America" },
  apac: { zh: "亚太", en: "APAC" },
  europe: { zh: "欧洲", en: "Europe" },
  japan: { zh: "日本", en: "Japan" },
  other: { zh: "其他", en: "Other" },
};

const officialLabels: LabelMap<OfficialStatus> = {
  confirmed: { zh: "官方确认", en: "Official" },
  suspected: { zh: "待确认", en: "Likely official" },
  unofficial: { zh: "非官方", en: "Unofficial" },
};

const suggestionLabels: LabelMap<Suggestion> = {
  "act-now": { zh: "立即行动", en: "Act now" },
  "worth-doing": { zh: "值得参加", en: "Worth doing" },
  watch: { zh: "先关注", en: "Watch" },
  skip: { zh: "跳过", en: "Skip" },
};

const typeSource: Record<string, OpportunityType> = {
  黑客松: "hackathon",
  hackathon: "hackathon",
  Hackathon: "hackathon",
  开发者挑战: "dev-challenge",
  开发者挑战赛: "dev-challenge",
  开发挑战: "dev-challenge",
  编程挑战: "dev-challenge",
  挑战赛: "dev-challenge",
  编程马拉松: "hackathon",
  AI挑战: "ai-competition",
  "AI 挑战": "ai-competition",
  竞赛: "ai-competition",
  开发者激励: "dev-incentive",
  开发激励: "dev-incentive",
  激励计划: "dev-incentive",
  "AI 竞赛": "ai-competition",
  AI竞赛: "ai-competition",
  AI比赛: "ai-competition",
  内测资格: "beta-access",
  内测体验: "beta-access",
  beta: "beta-access",
  权益: "benefit",
  福利: "benefit",
  福利发放: "benefit",
  会员权益: "benefit",
  内容创作: "content-creation",
  创作活动: "content-creation",
};

const rewardSource: Record<string, RewardType> = {
  奖金: "cash",
  现金: "cash",
  cash: "cash",
  "API 积分": "api-credits",
  API积分: "api-credits",
  "API Credits": "api-credits",
  credits: "api-credits",
  会员: "membership",
  会员权益: "membership",
  实物: "physical",
  周边: "physical",
  证书: "certificate",
  certificate: "certificate",
  云积分: "api-credits",
  算力: "api-credits",
  代金券: "cash",
};

const regionSource: Record<string, Region> = {
  全球: "global",
  Global: "global",
  global: "global",
  中国: "china",
  China: "china",
  北美: "north-america",
  美国: "north-america",
  "North America": "north-america",
  亚太: "apac",
  APAC: "apac",
  欧洲: "europe",
  Europe: "europe",
  日本: "japan",
  Japan: "japan",
};

export function normalizeOpportunityType(value: string | null): OpportunityType {
  return value ? typeSource[value.trim()] ?? "other" : "other";
}

export function normalizeRewardType(value: string): RewardType {
  return rewardSource[value.trim()] ?? "other";
}

export function normalizeRegion(value: string | null): Region {
  return value ? regionSource[value.trim()] ?? "other" : "other";
}

export function normalizeOfficialStatus(value: string | null): OfficialStatus {
  if (!value) return "suspected";
  if (value.includes("✅") || value.includes("官方") || /confirmed|official/i.test(value)) return "confirmed";
  if (value.includes("❌") || value.includes("非官方") || /unofficial/i.test(value)) return "unofficial";
  return "suspected";
}

export function normalizeSuggestion(value: string | null): Suggestion | null {
  if (!value) return null;
  if (value.includes("立即")) return "act-now";
  if (value.includes("值得")) return "worth-doing";
  if (value.includes("观望") || value.includes("关注")) return "watch";
  if (value.includes("跳过")) return "skip";
  return null;
}

export function parseDifficulty(value: string | null): Difficulty | null {
  if (!value) return null;
  const stars = (value.match(/[★⭐]/g) ?? []).length;
  if (stars >= 1 && stars <= 5) return stars as Difficulty;
  const digit = Number(value.match(/[1-5]/)?.[0]);
  return digit >= 1 && digit <= 5 ? (digit as Difficulty) : null;
}

export function enumLabel(kind: "type", value: OpportunityType, locale: Locale): string;
export function enumLabel(kind: "reward", value: RewardType, locale: Locale): string;
export function enumLabel(kind: "region", value: Region, locale: Locale): string;
export function enumLabel(kind: "official", value: OfficialStatus, locale: Locale): string;
export function enumLabel(kind: "suggestion", value: Suggestion, locale: Locale): string;
export function enumLabel(kind: string, value: string, locale: Locale) {
  if (kind === "type") return typeLabels[value as OpportunityType]?.[locale] ?? value;
  if (kind === "reward") return rewardLabels[value as RewardType]?.[locale] ?? value;
  if (kind === "region") return regionLabels[value as Region]?.[locale] ?? value;
  if (kind === "official") return officialLabels[value as OfficialStatus]?.[locale] ?? value;
  return suggestionLabels[value as Suggestion]?.[locale] ?? value;
}
