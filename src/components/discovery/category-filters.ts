import type { Locale } from "@/i18n/locales";
import type { Region, RewardType } from "@/lib/opportunity/enums";
import { enumLabel } from "@/lib/opportunity/enums";
import { getDeadlineBucket } from "@/lib/opportunity/derive";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

export const CATEGORY_FILTER_KEYS = ["deadline", "format", "reward", "region", "difficulty"] as const;
export type CategoryFilterKey = (typeof CATEGORY_FILTER_KEYS)[number];

export type DeadlineFilter = "any" | "ending-soon" | "ongoing" | "long-term";
export type FormatFilter = "any" | "online" | "in-person" | "hybrid";
export type RewardFilter = "any" | RewardType;
export type RegionFilter = "any" | Region;
export type DifficultyFilter = "any" | "1" | "2" | "3" | "4" | "5";

export type CategoryFilterState = {
  deadline: DeadlineFilter;
  format: FormatFilter;
  reward: RewardFilter;
  region: RegionFilter;
  difficulty: DifficultyFilter;
};

export const emptyCategoryFilters: CategoryFilterState = {
  deadline: "any",
  format: "any",
  reward: "any",
  region: "any",
  difficulty: "any",
};

const filterIcons = {
  deadline: "calendar",
  format: "grid",
  reward: "gift",
  region: "globe",
  difficulty: "sliders",
} as const;

export function getFilterIcon(key: CategoryFilterKey) {
  return filterIcons[key];
}

type Option<T extends string> = { value: T; label: Record<Locale, string> };

const deadlineOptions: Option<DeadlineFilter>[] = [
  { value: "any", label: { zh: "任意时间", en: "Any time" } },
  { value: "ending-soon", label: { zh: "即将截止", en: "Ending soon" } },
  { value: "ongoing", label: { zh: "进行中", en: "Open" } },
  { value: "long-term", label: { zh: "长期开放", en: "Long-term" } },
];

const formatOptions: Option<FormatFilter>[] = [
  { value: "any", label: { zh: "任意形式", en: "Any format" } },
  { value: "online", label: { zh: "线上", en: "Online" } },
  { value: "in-person", label: { zh: "线下", en: "In person" } },
  { value: "hybrid", label: { zh: "混合", en: "Hybrid" } },
];

const rewardOptions: Option<RewardFilter>[] = [
  { value: "any", label: { zh: "任意奖励", en: "Any reward" } },
  { value: "cash", label: { zh: "奖金", en: "Cash" } },
  { value: "api-credits", label: { zh: "API 积分", en: "API credits" } },
  { value: "membership", label: { zh: "会员权益", en: "Membership" } },
  { value: "physical", label: { zh: "实物", en: "Physical prize" } },
  { value: "certificate", label: { zh: "证书", en: "Certificate" } },
];

const regionOptions: Option<RegionFilter>[] = [
  { value: "any", label: { zh: "任意地区", en: "Any region" } },
  ...(["global", "china", "north-america", "apac", "europe", "japan"] as const).map((value) => ({
    value,
    label: { zh: enumLabel("region", value, "zh"), en: enumLabel("region", value, "en") },
  })),
];

const difficultyOptions: Option<DifficultyFilter>[] = [
  { value: "any", label: { zh: "任意难度", en: "Any level" } },
  ...([1, 2, 3, 4, 5] as const).map((value) => ({
    value: String(value) as DifficultyFilter,
    label: { zh: `${value} 星`, en: `${value} star${value > 1 ? "s" : ""}` },
  })),
];

export const categoryFilterOptions: Record<CategoryFilterKey, Option<string>[]> = {
  deadline: deadlineOptions,
  format: formatOptions,
  reward: rewardOptions,
  region: regionOptions,
  difficulty: difficultyOptions,
};

export function getFilterValueLabel(key: CategoryFilterKey, value: string, locale: Locale) {
  const option = categoryFilterOptions[key].find((item) => item.value === value);
  return option?.label[locale] ?? value;
}

function matchesFormat(format: string | null, filter: FormatFilter) {
  const text = (format ?? "").toLowerCase();
  if (filter === "any") return true;
  if (filter === "online") return /online|线上|远程/.test(text);
  if (filter === "in-person") return /in[\s-]?person|onsite|offline|现场|线下/.test(text);
  return /hybrid|混合/.test(text);
}

export function matchesCategoryFilters(item: ActivityOpportunity, filters: CategoryFilterState, now = new Date()) {
  if (filters.deadline !== "any") {
    const bucket = getDeadlineBucket(item.endAt, now);
    if (filters.deadline === "ending-soon" && !["ending-3d", "ending-7d"].includes(bucket)) return false;
    if (filters.deadline === "ongoing" && bucket !== "ongoing") return false;
    if (filters.deadline === "long-term" && bucket !== "long-term") return false;
  }
  if (!matchesFormat(item.format, filters.format)) return false;
  if (filters.reward !== "any" && !item.rewardTypes.includes(filters.reward)) return false;
  if (filters.region !== "any" && item.region !== filters.region) return false;
  if (filters.difficulty !== "any" && item.difficulty !== Number(filters.difficulty)) return false;
  return true;
}

export function hasActiveCategoryFilters(filters: CategoryFilterState) {
  return CATEGORY_FILTER_KEYS.some((key) => filters[key] !== "any");
}

export function matchesOpportunitySearch(item: ActivityOpportunity, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = `${item.title} ${item.vendor} ${item.rewardSummary ?? ""} ${item.rewardDetail ?? ""}`.toLowerCase();
  return haystack.includes(normalized);
}
