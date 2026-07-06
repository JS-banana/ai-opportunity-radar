"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/atlas/Icon";
import { DeadlineBadge } from "@/components/opportunity/DeadlineWidgets";
import { imageFor, modeLabel } from "@/components/opportunity/card-helpers";
import { copy } from "@/content/atlas-copy";
import type { Locale } from "@/i18n/locales";
import { detailPath, formatDate } from "@/lib/opportunity/derive";
import { enumLabel } from "@/lib/opportunity/enums";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

type OpportunityCardProps = {
  item: ActivityOpportunity;
  index: number;
  locale: Locale;
  large?: boolean;
  lifted?: boolean;
};

export function OpportunityCard({ item, index, locale, large = false, lifted = false }: OpportunityCardProps) {
  const text = copy[locale];
  return (
    <article className={["opportunity-card", large ? "large" : "", lifted ? "lifted" : ""].filter(Boolean).join(" ")}>
      <div className="card-media">
        <Image src={imageFor(item, index)} alt="" fill sizes={large ? "(min-width: 900px) 31vw, 100vw" : "(min-width: 900px) 30vw, 100vw"} />
        <button className="bookmark" type="button" aria-label={text.save}>
          <Icon name="bookmark" />
        </button>
      </div>
      <div className="card-body">
        <span className="type-tag">{enumLabel("type", item.type, locale)}</span>
        <h3>{item.title}</h3>
        <p className="vendor-line">
          {item.vendor}
          {item.officialStatus === "confirmed" ? <Icon name="verified" /> : null}
        </p>
        <div className="meta-line">
          <span>
            <Icon name="globe" />
            {modeLabel(item, locale)}
          </span>
          <span>
            <Icon name="calendar" />
            {formatDate(item.endAt, locale)}
          </span>
          <DeadlineBadge item={item} locale={locale} />
        </div>
        <p className="summary">{item.participation ?? item.timelineNotes ?? item.rewardDetail ?? item.rewardSummary}</p>
        <div className="reward-box">
          <Icon name={item.rewardTypes.includes("cash") ? "trophy" : "gift"} />
          <b>{item.rewardSummary ?? enumLabel("type", item.type, locale)}</b>
          <small>{item.estimatedEffort ?? enumLabel("official", item.officialStatus, locale)}</small>
        </div>
        <div className="card-footer">
          <span>{item.sourceChannel ?? item.vendor}</span>
          <Link href={detailPath(locale, item)}>{text.details}</Link>
        </div>
        {lifted ? (
          <div className="quick-actions">
            <button type="button">
              <Icon name="bookmark" />
              {text.save}
            </button>
            <Link href={detailPath(locale, item)}>
              {text.details}
              <Icon name="arrow" />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
