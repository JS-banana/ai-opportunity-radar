import type { Locale } from "@/i18n/locales";
import type { ActivityOpportunity } from "./model";

const dayMs = 24 * 60 * 60 * 1000;

export type DeadlineBucket = "expired" | "ending-3d" | "ending-7d" | "ongoing" | "long-term";
export type PublicStatus = "expired" | "ending-soon" | "ongoing" | "long-term";

export function makeSlug(title: string): string | null {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || null;
}

export function getDeadlineBucket(endAt: string | null, now = new Date()): DeadlineBucket {
  if (!endAt) return "long-term";
  const end = new Date(endAt).getTime();
  const current = now.getTime();
  if (end < current) return "expired";
  const diff = end - current;
  if (diff <= 3 * dayMs) return "ending-3d";
  if (diff <= 7 * dayMs) return "ending-7d";
  return "ongoing";
}

export function getPublicStatus(endAt: string | null, now = new Date()): PublicStatus {
  const bucket = getDeadlineBucket(endAt, now);
  if (bucket === "expired") return "expired";
  if (bucket === "ending-3d" || bucket === "ending-7d") return "ending-soon";
  return bucket;
}

export function publicStatusLabel(status: PublicStatus, locale: Locale) {
  const labels: Record<PublicStatus, Record<Locale, string>> = {
    expired: { zh: "已过期", en: "Expired" },
    "ending-soon": { zh: "即将截止", en: "Ending soon" },
    ongoing: { zh: "进行中", en: "Open" },
    "long-term": { zh: "长期", en: "Long-term" },
  };
  return labels[status][locale];
}

export function deadlineLabel(opportunity: ActivityOpportunity, locale: Locale, now = new Date()) {
  const bucket = getDeadlineBucket(opportunity.endAt, now);
  if (bucket === "long-term") return locale === "zh" ? "长期开放" : "Long-term";
  if (!opportunity.endAt) return "";
  const diffDays = Math.max(0, Math.ceil((new Date(opportunity.endAt).getTime() - now.getTime()) / dayMs));
  if (bucket === "expired") return locale === "zh" ? "已过期" : "Expired";
  return locale === "zh" ? `${diffDays} 天` : `${diffDays} days`;
}

export function formatDate(value: string | null, locale: Locale) {
  if (!value) return locale === "zh" ? "长期" : "Long-term";
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function sortOpportunities(opportunities: ActivityOpportunity[], now = new Date()) {
  const urgency: Record<DeadlineBucket, number> = {
    "ending-3d": 4,
    "ending-7d": 3,
    ongoing: 2,
    "long-term": 1,
    expired: 0,
  };
  return [...opportunities].sort((a, b) => {
    const aBucket = getDeadlineBucket(a.endAt, now);
    const bBucket = getDeadlineBucket(b.endAt, now);
    if (aBucket === "expired" && bBucket !== "expired") return 1;
    if (aBucket !== "expired" && bBucket === "expired") return -1;
    if (b.score !== a.score) return b.score - a.score;
    if (urgency[bBucket] !== urgency[aBucket]) return urgency[bBucket] - urgency[aBucket];
    return new Date(b.discoveredAt ?? 0).getTime() - new Date(a.discoveredAt ?? 0).getTime();
  });
}

export function featuredOpportunities(opportunities: ActivityOpportunity[], limit = 3, now = new Date()) {
  return sortOpportunities(opportunities, now)
    .filter((item) => item.score >= 4 && item.officialStatus === "confirmed" && getDeadlineBucket(item.endAt, now) !== "expired")
    .slice(0, limit);
}

export function detailPath(locale: Locale, opportunity: ActivityOpportunity) {
  const suffix = opportunity.slug ? `/${opportunity.slug}` : "";
  return `/${locale}/o/${opportunity.id}${suffix}`;
}

export function shouldEmitEventJsonLd(opportunity: ActivityOpportunity) {
  return (
    ["hackathon", "ai-competition", "dev-challenge"].includes(opportunity.type) &&
    Boolean(opportunity.startAt && opportunity.endAt && opportunity.registrationUrl)
  );
}
