import type { CSSProperties } from "react";
import { copy } from "@/content/atlas-copy";
import type { Locale } from "@/i18n/locales";
import { enumLabel, type OfficialStatus } from "@/lib/opportunity/enums";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

export type VendorTagColors = {
  bg: string;
  text: string;
  border: string;
};

// Feishu Base single-select tints (background / foreground / border).
const FEISHU_PALETTE: VendorTagColors[] = [
  { bg: "#e8f3ff", text: "#245bdb", border: "rgba(36, 91, 219, 0.24)" },
  { bg: "#e1f6fd", text: "#037eaa", border: "rgba(3, 126, 170, 0.24)" },
  { bg: "#d5f6f2", text: "#078372", border: "rgba(7, 131, 114, 0.24)" },
  { bg: "#e3f9e9", text: "#2ea121", border: "rgba(46, 161, 33, 0.24)" },
  { bg: "#f0f8d4", text: "#5c7a00", border: "rgba(92, 122, 0, 0.24)" },
  { bg: "#faf1d1", text: "#aa7803", border: "rgba(170, 120, 3, 0.24)" },
  { bg: "#feead2", text: "#b26206", border: "rgba(178, 98, 6, 0.24)" },
  { bg: "#fde2e2", text: "#c02a26", border: "rgba(192, 42, 38, 0.24)" },
  { bg: "#fce4f2", text: "#b82879", border: "rgba(184, 40, 121, 0.24)" },
  { bg: "#f3e8ff", text: "#7c3aed", border: "rgba(124, 58, 237, 0.24)" },
  { bg: "#ece2fe", text: "#6425d0", border: "rgba(100, 37, 208, 0.24)" },
  { bg: "#e0e2fa", text: "#2933c7", border: "rgba(41, 51, 199, 0.24)" },
  { bg: "#eff0f1", text: "#646a73", border: "rgba(100, 106, 115, 0.24)" },
];

const vendorColorOverrides: Record<string, VendorTagColors> = {
  Google: { bg: "#e8f0fe", text: "#1a73e8", border: "rgba(26, 115, 232, 0.24)" },
  OpenAI: { bg: "#e7f6f1", text: "#0d8f6f", border: "rgba(13, 143, 111, 0.24)" },
  NVIDIA: { bg: "#e8f8e8", text: "#76b900", border: "rgba(118, 185, 0, 0.28)" },
  AWS: { bg: "#fff4e5", text: "#c45500", border: "rgba(196, 85, 0, 0.24)" },
  Microsoft: { bg: "#e8f3ff", text: "#0078d4", border: "rgba(0, 120, 212, 0.24)" },
  Vercel: { bg: "#f3f3f3", text: "#171717", border: "rgba(23, 23, 23, 0.18)" },
  Tencent: { bg: "#e8f3ff", text: "#0052d9", border: "rgba(0, 82, 217, 0.24)" },
  腾讯: { bg: "#e8f3ff", text: "#0052d9", border: "rgba(0, 82, 217, 0.24)" },
  百度: { bg: "#e8f0fe", text: "#2932e1", border: "rgba(41, 50, 225, 0.24)" },
  华为: { bg: "#fde2e2", text: "#c7000b", border: "rgba(199, 0, 11, 0.24)" },
  字节: { bg: "#fde2e2", text: "#fe2c55", border: "rgba(254, 44, 85, 0.24)" },
  蚂蚁集团: { bg: "#e1f6fd", text: "#1677ff", border: "rgba(22, 119, 255, 0.24)" },
  "天池(阿里云)": { bg: "#fff4e5", text: "#ff6a00", border: "rgba(255, 106, 0, 0.24)" },
  "阿里云+天池": { bg: "#fff4e5", text: "#ff6a00", border: "rgba(255, 106, 0, 0.24)" },
  Bitget: { bg: "#e0f7fa", text: "#00b4c8", border: "rgba(0, 180, 200, 0.24)" },
  IBM: { bg: "#e8f3ff", text: "#054ada", border: "rgba(5, 74, 218, 0.24)" },
  Salesforce: { bg: "#e8f3ff", text: "#0176d3", border: "rgba(1, 118, 211, 0.24)" },
  AMD: { bg: "#fde2e2", text: "#ed1c24", border: "rgba(237, 28, 36, 0.24)" },
  "HuggingFace + OpenAI": { bg: "#fff8e1", text: "#d97706", border: "rgba(217, 119, 6, 0.24)" },
  ETHGlobal: { bg: "#ece2fe", text: "#6425d0", border: "rgba(100, 37, 208, 0.24)" },
  DevNetwork: { bg: "#e3f9e9", text: "#2ea121", border: "rgba(46, 161, 33, 0.24)" },
  "lablab.ai": { bg: "#f3e8ff", text: "#7c3aed", border: "rgba(124, 58, 237, 0.24)" },
};

function paletteIndex(value: string) {
  let hash = 0;
  for (const char of value) hash = (hash + char.charCodeAt(0) * 17) % FEISHU_PALETTE.length;
  return hash;
}

export function vendorTagColors(vendor: string): VendorTagColors {
  const trimmed = vendor.trim();
  if (!trimmed) return FEISHU_PALETTE[0];
  const direct = vendorColorOverrides[trimmed];
  if (direct) return direct;
  const lower = trimmed.toLowerCase();
  const caseInsensitive = Object.entries(vendorColorOverrides).find(([key]) => key.toLowerCase() === lower)?.[1];
  if (caseInsensitive) return caseInsensitive;
  const partial = Object.entries(vendorColorOverrides).find(([key]) => trimmed.includes(key) || key.includes(trimmed))?.[1];
  if (partial) return partial;
  return FEISHU_PALETTE[paletteIndex(trimmed)];
}

export function vendorTagStyle(vendor: string): CSSProperties {
  const colors = vendorTagColors(vendor);
  return {
    backgroundColor: colors.bg,
    color: colors.text,
    borderColor: colors.border,
  };
}

const OFFICIAL_STATUS_COLORS: Record<OfficialStatus, VendorTagColors> = {
  confirmed: { bg: "#e3f9e9", text: "#2ea121", border: "rgba(46, 161, 33, 0.24)" },
  suspected: { bg: "#faf1d1", text: "#aa7803", border: "rgba(170, 120, 3, 0.24)" },
  unofficial: { bg: "#fde2e2", text: "#c02a26", border: "rgba(192, 42, 38, 0.24)" },
};

export function officialTagStyle(status: OfficialStatus): CSSProperties {
  const colors = OFFICIAL_STATUS_COLORS[status];
  return {
    backgroundColor: colors.bg,
    color: colors.text,
    borderColor: colors.border,
  };
}

export const imagePool = [
  "/assets/event-pass-macro.png",
  "/assets/coding-workshop-duotone.png",
  "/assets/path-api-credits-card.png",
  "/assets/source-dossier-desk.png",
  "/assets/path-prize-envelope.png",
  "/assets/path-submission-stage.png",
  "/assets/hero-hackathon-overhead.png",
  "/assets/path-member-benefits-card.png",
  "/assets/detail-og-city-crop.png",
];

export function imageFor(item: ActivityOpportunity, index: number) {
  if (item.type === "hackathon") return "/assets/event-pass-macro.png";
  if (item.rewardTypes.includes("api-credits")) return "/assets/path-api-credits-card.png";
  if (item.rewardTypes.includes("cash")) return "/assets/path-prize-envelope.png";
  if (item.type === "benefit") return "/assets/path-member-benefits-card.png";
  return imagePool[index % imagePool.length];
}

export function modeLabel(item: ActivityOpportunity, locale: Locale) {
  if (item.format && /online/i.test(item.format)) return copy[locale].online;
  return enumLabel("region", item.region, locale) || copy[locale].global;
}

export function deadlineSort(item: ActivityOpportunity) {
  if (!item.endAt) return Number.MAX_SAFE_INTEGER;
  return new Date(item.endAt).getTime();
}

// Public-facing channel names from the campaign-radar source registry. Internal
// scan-run labels (DDG_broad, broad_en, web_search…) must never reach the UI.
const PUBLIC_SOURCE_CHANNELS = new Map(
  [
    "官网",
    "AgentDeadlines",
    "Devpost",
    "lablab.ai",
    "DoraHacks",
    "HuggingFace",
    "V2EX",
    "天池",
    "CompeteHub",
    "aihot.today",
    "Kaggle",
    "MLH",
    "HackerNoon",
    "ETHGlobal",
    "Twitter",
    "Reddit",
    "Hacker News",
    "活动行",
    "SegmentFault",
    "WayToAGI",
    "GitHub",
    "dev.events",
    "Luma",
    "Cerebral Valley",
    "Devfolio",
    "Unstop",
    "AIcrowd",
    "DataFountain",
    "魔搭",
  ].map((name) => [name.toLowerCase(), name] as const),
);

const SOURCE_CHANNEL_ALIASES: Record<string, string> = {
  tianchi: "天池",
};

/** Whitelisted display name for the record's source channel, or null when internal/unknown. */
export function publicSourceChannel(item: ActivityOpportunity): string | null {
  const channel = item.sourceChannel?.trim();
  if (!channel) return null;
  const lower = channel.toLowerCase();
  return SOURCE_CHANNEL_ALIASES[lower] ?? PUBLIC_SOURCE_CHANNELS.get(lower) ?? null;
}

export function sourceLabel(item: ActivityOpportunity) {
  return publicSourceChannel(item) ?? item.vendor;
}

function normalizeLabel(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function cardSummary(item: ActivityOpportunity) {
  const value = item.participation ?? item.timelineNotes ?? item.rewardDetail ?? item.rewardSummary;
  return value?.trim() ? value.trim() : null;
}

/** Footer source/vendor label when it adds information not already shown in the card body. */
export function footerSourceLabel(item: ActivityOpportunity, locale: Locale) {
  const source = sourceLabel(item).trim();
  if (!source) return null;

  const normalized = normalizeLabel(source);
  const bodyLabels = [
    item.vendor,
    cardSummary(item),
    item.rewardSummary,
    enumLabel("type", item.type, locale),
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeLabel);

  if (bodyLabels.includes(normalized)) return null;
  return source;
}
