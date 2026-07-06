"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/atlas/Icon";
import { imageFor, modeLabel } from "@/components/opportunity/card-helpers";
import type { Locale } from "@/i18n/locales";
import { deadlineLabel, detailPath, getDeadlineBucket } from "@/lib/opportunity/derive";
import { enumLabel } from "@/lib/opportunity/enums";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

type DeadlineBadgeProps = {
  item: ActivityOpportunity;
  locale: Locale;
};

export function DeadlineBadge({ item, locale }: DeadlineBadgeProps) {
  const bucket = getDeadlineBucket(item.endAt);
  const label = deadlineLabel(item, locale);
  const text = locale === "zh" ? (bucket === "long-term" ? label : `${label}截止`) : bucket === "long-term" ? label : `Ends in ${label}`;
  return (
    <span className={bucket === "ending-3d" || bucket === "ending-7d" ? "deadline-badge urgent" : "deadline-badge"}>
      <Icon name="clock" />
      {text}
    </span>
  );
}

type DeadlineCardProps = {
  item: ActivityOpportunity;
  index: number;
  locale: Locale;
};

export function DeadlineCard({ item, index, locale }: DeadlineCardProps) {
  const cardLabel = locale === "zh" ? `查看 ${item.title} 详情` : `View details for ${item.title}`;

  return (
    <Link href={detailPath(locale, item)} className="deadline-card" aria-label={cardLabel}>
      <Image src={imageFor(item, index)} alt="" width={104} height={104} />
      <div>
        <h3>{item.title}</h3>
        <span className="type-tag">{enumLabel("type", item.type, locale)}</span>
        <p>
          {modeLabel(item, locale)} <span>·</span> {item.rewardSummary ?? enumLabel("type", item.type, locale)}
        </p>
      </div>
      <DeadlineBadge item={item} locale={locale} />
    </Link>
  );
}
