"use client";

import Image from "next/image";
import { Icon } from "@/components/atlas/Icon";
import { imageFor, modeLabel } from "@/components/opportunity/card-helpers";
import type { Locale } from "@/i18n/locales";
import { deadlineLabel, getDeadlineBucket } from "@/lib/opportunity/derive";
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

type DeadlinePillProps = {
  item: ActivityOpportunity;
  index: number;
  locale: Locale;
};

export function DeadlinePill({ item, index, locale }: DeadlinePillProps) {
  return (
    <article className="deadline-pill">
      <Image src={imageFor(item, index)} alt="" width={40} height={40} />
      <b>{item.title}</b>
      <DeadlineBadge item={item} locale={locale} />
    </article>
  );
}

type DeadlineCardProps = {
  item: ActivityOpportunity;
  index: number;
  locale: Locale;
};

export function DeadlineCard({ item, index, locale }: DeadlineCardProps) {
  return (
    <article className="deadline-card">
      <Image src={imageFor(item, index)} alt="" width={104} height={104} />
      <div>
        <h3>{item.title}</h3>
        <span className="type-tag">{enumLabel("type", item.type, locale)}</span>
        <p>
          {modeLabel(item, locale)} <span>·</span> {item.rewardSummary ?? enumLabel("type", item.type, locale)}
        </p>
      </div>
      <DeadlineBadge item={item} locale={locale} />
    </article>
  );
}
