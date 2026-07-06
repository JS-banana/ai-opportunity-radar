"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/atlas/Icon";
import { DeadlineBadge } from "@/components/opportunity/DeadlineWidgets";
import { cardSummary, footerSourceLabel, imageFor, modeLabel, vendorTagStyle } from "@/components/opportunity/card-helpers";
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
};

export function OpportunityCard({ item, index, locale, large = false }: OpportunityCardProps) {
  const text = copy[locale];
  const summary = cardSummary(item);
  const footerSource = footerSourceLabel(item, locale);
  const cardLabel = locale === "zh" ? `查看 ${item.title} 详情` : `View details for ${item.title}`;

  return (
    <Link
      href={detailPath(locale, item)}
      className={["opportunity-card", large ? "large" : ""].filter(Boolean).join(" ")}
      aria-label={cardLabel}
    >
      <div className="card-media">
        <Image src={imageFor(item, index)} alt="" fill sizes={large ? "(min-width: 900px) 31vw, 100vw" : "(min-width: 900px) 30vw, 100vw"} />
      </div>
      <div className="card-body">
        <div className="card-main">
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
          </div>
          <div
            className="score-line"
            aria-label={locale === "zh" ? `${text.scoreIndex} ${item.score}/5` : `${text.scoreIndex} ${item.score}/5`}
          >
            <span className="score-label">{text.scoreIndex}</span>
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className={index < item.score ? "filled" : "empty"}>
                ★
              </span>
            ))}
          </div>
          {summary ? <p className="summary">{summary}</p> : null}
          <div className="reward-box">
            <Icon name={item.rewardTypes.includes("cash") ? "trophy" : "gift"} />
            <b>{item.rewardSummary ?? enumLabel("type", item.type, locale)}</b>
            <small>{item.estimatedEffort ?? enumLabel("official", item.officialStatus, locale)}</small>
          </div>
        </div>
        <div className="card-footer">
          <div className="card-footer-left">
            <span className="type-tag">{enumLabel("type", item.type, locale)}</span>
            {footerSource ? (
              <span className="vendor-tag" style={vendorTagStyle(item.vendor)}>
                {footerSource}
              </span>
            ) : null}
          </div>
          <DeadlineBadge item={item} locale={locale} />
        </div>
      </div>
    </Link>
  );
}
