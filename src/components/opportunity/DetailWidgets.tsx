import { Icon } from "@/components/atlas/Icon";
import { officialTagStyle } from "@/components/opportunity/card-helpers";
import { DeadlineBadge } from "@/components/opportunity/DeadlineWidgets";
import type { Locale } from "@/i18n/locales";
import { enumLabel, type OfficialStatus } from "@/lib/opportunity/enums";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

type StarRatingProps = {
  label: string;
  value: number;
  max?: number;
};

export function StarRating({ label, value, max = 5 }: StarRatingProps) {
  return (
    <div className="score-line detail-rating" aria-label={`${label} ${value}/${max}`}>
      <span className="score-label">{label}</span>
      {Array.from({ length: max }, (_, index) => (
        <span key={index} className={index < value ? "filled" : "empty"}>
          ★
        </span>
      ))}
      <span className="rating-fraction">
        {value}/{max}
      </span>
    </div>
  );
}

type OfficialStatusBadgeProps = {
  status: OfficialStatus;
  locale: Locale;
};

export function OfficialStatusBadge({ status, locale }: OfficialStatusBadgeProps) {
  return (
    <span className="official-status-tag" style={officialTagStyle(status)}>
      {status === "confirmed" ? <Icon name="verified" /> : null}
      {enumLabel("official", status, locale)}
    </span>
  );
}

type DetailDeadlineFactProps = {
  item: ActivityOpportunity;
  locale: Locale;
};

export function DetailDeadlineFact({ item, locale }: DetailDeadlineFactProps) {
  return <DeadlineBadge item={item} locale={locale} />;
}

const PERCENT_PATTERN = /(\d+(?:\.\d+)?%)/g;

function highlightPercentages(text: string) {
  return text.split(PERCENT_PATTERN).map((part, index) =>
    /^\d+(?:\.\d+)?%$/.test(part) ? (
      <span key={index} className="detail-percent">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

type DetailSectionBodyProps = {
  content: string;
  locale: Locale;
  variant?: "default" | "reward" | "criteria";
};

export function DetailSectionBody({ content, locale, variant = "default" }: DetailSectionBodyProps) {
  const className =
    variant === "reward" ? "detail-section-body detail-reward-body" : variant === "criteria" ? "detail-section-body detail-criteria-body" : "detail-section-body";

  return (
    <p className={className} lang={locale === "en" ? "zh" : undefined}>
      {variant === "criteria" ? highlightPercentages(content) : content}
    </p>
  );
}
