import { copy } from "@/content/atlas-copy";
import type { Locale } from "@/i18n/locales";
import { enumLabel } from "@/lib/opportunity/enums";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

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
