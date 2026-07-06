import type { Locale } from "@/i18n/locales";

const minuteMs = 60 * 1000;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;

export function formatSnapshotAge(generatedAt: string, locale: Locale, now = new Date()) {
  const diffMs = Math.max(0, now.getTime() - new Date(generatedAt).getTime());
  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.floor(diffMs / minuteMs));
    return locale === "zh" ? `${minutes} 分钟前` : `${minutes}m ago`;
  }
  if (diffMs < dayMs) {
    const hours = Math.max(1, Math.floor(diffMs / hourMs));
    return locale === "zh" ? `${hours} 小时前` : `${hours}h ago`;
  }
  const days = Math.max(1, Math.floor(diffMs / dayMs));
  return locale === "zh" ? `${days} 天前` : `${days}d ago`;
}
