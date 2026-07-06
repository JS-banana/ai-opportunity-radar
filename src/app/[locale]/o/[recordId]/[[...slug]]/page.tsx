import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailDeadlineFact, DetailSectionBody, OfficialStatusBadge, StarRating } from "@/components/opportunity/DetailWidgets";
import { copy } from "@/content/atlas-copy";
import { isLocale, type Locale } from "@/i18n/locales";
import { detailPath, formatDate, getPublicStatus, publicStatusLabel, shouldEmitEventJsonLd } from "@/lib/opportunity/derive";
import { enumLabel } from "@/lib/opportunity/enums";
import type { ActivityOpportunity } from "@/lib/opportunity/model";
import { getSnapshot } from "@/lib/snapshot/get";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = {
  params: Promise<{ locale: string; recordId: string; slug?: string[] }>;
};

async function findOpportunity(params: Props["params"]) {
  const { locale, recordId } = await params;
  if (!isLocale(locale)) notFound();
  const { snapshot } = await getSnapshot();
  const opportunity = snapshot.opportunities.find((item) => item.id === recordId);
  if (!opportunity) notFound();
  return { locale: locale as Locale, opportunity };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, opportunity } = await findOpportunity(params);
  const description = opportunity.rewardSummary ?? opportunity.rewardDetail ?? `${opportunity.vendor} ${enumLabel("type", opportunity.type, locale)}`;
  const canonical = `${siteUrl}${detailPath(locale, opportunity)}`;

  return {
    title: `${opportunity.title} | ${copy[locale].siteName}`,
    description,
    alternates: {
      canonical,
      languages: {
        zh: `${siteUrl}${detailPath("zh", opportunity)}`,
        en: `${siteUrl}${detailPath("en", opportunity)}`,
        "x-default": `${siteUrl}${detailPath("zh", opportunity)}`,
      },
    },
    openGraph: {
      title: opportunity.title,
      description,
      url: canonical,
      type: "article",
    },
  };
}

export default async function OpportunityDetail({ params }: Props) {
  const { locale, opportunity } = await findOpportunity(params);
  const text = copy[locale];
  const detail = text.detail;
  const status = publicStatusLabel(getPublicStatus(opportunity.endAt), locale);

  return (
    <main className="opportunity-detail-page">
      {shouldEmitEventJsonLd(opportunity) ? <JsonLd opportunity={opportunity} locale={locale} /> : null}
      <nav className="detail-nav">
        <Link href={`/${locale}`}>{text.siteName}</Link>
        <Link href={`/${locale}`}>{detail.discovery}</Link>
        <a href={`/go/${opportunity.id}`}>{detail.officialEntry}</a>
      </nav>
      <article className="detail-document">
        <div className="detail-kicker">
          {enumLabel("type", opportunity.type, locale)} / {status}
        </div>
        <h1>{opportunity.title}</h1>
        <p className="detail-vendor">{opportunity.vendor}</p>
        <div className="detail-actions">
          <a className="primary-button compact detail-outbound" href={`/go/${opportunity.id}`}>
            {detail.enterOfficial}
          </a>
          <OfficialStatusBadge status={opportunity.officialStatus} locale={locale} />
        </div>
        <dl className="detail-facts">
          <div className="detail-fact detail-fact-score">
            <dt>{text.scoreIndex}</dt>
            <dd>
              <StarRating label={text.scoreIndex} value={opportunity.score} />
            </dd>
          </div>
          <div className="detail-fact detail-fact-deadline">
            <dt>{detail.deadline}</dt>
            <dd>
              <DetailDeadlineFact item={opportunity} locale={locale} />
            </dd>
          </div>
          <div className="detail-fact">
            <dt>{detail.region}</dt>
            <dd>{enumLabel("region", opportunity.region, locale)}</dd>
          </div>
          <div className="detail-fact detail-fact-difficulty">
            <dt>{detail.difficulty}</dt>
            <dd>
              {opportunity.difficulty ? (
                <StarRating label={detail.difficulty} value={opportunity.difficulty} />
              ) : (
                <span className="detail-unset">{detail.difficultyUnset}</span>
              )}
            </dd>
          </div>
        </dl>
        <DetailSection title={detail.reward} content={opportunity.rewardDetail ?? opportunity.rewardSummary} locale={locale} variant="reward" />
        <DetailSection title={detail.participation} content={opportunity.participation} locale={locale} />
        <DetailSection title={detail.winningCriteria} content={opportunity.winningCriteria} locale={locale} variant="criteria" />
        <DetailSection title={detail.timeline} content={opportunity.timelineNotes} locale={locale} />
        <footer className="detail-footer">
          <span>
            {detail.source}: {opportunity.sourceChannel ?? detail.maintainedRecord}
          </span>
          <span>
            {detail.discovered}: {formatDate(opportunity.discoveredAt, locale)}
          </span>
        </footer>
      </article>
    </main>
  );
}

type DetailSectionProps = {
  title: string;
  content: string | null;
  locale: Locale;
  variant?: "default" | "reward" | "criteria";
};

function DetailSection({ title, content, locale, variant = "default" }: DetailSectionProps) {
  if (!content) return null;
  const sectionClass = variant === "reward" ? "detail-section detail-section-reward" : "detail-section";
  return (
    <section className={sectionClass}>
      <h2>{title}</h2>
      <DetailSectionBody content={content} locale={locale} variant={variant} />
    </section>
  );
}

function JsonLd({ opportunity, locale }: { opportunity: ActivityOpportunity; locale: Locale }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: opportunity.title,
    startDate: opportunity.startAt,
    endDate: opportunity.endAt,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    url: `${siteUrl}${detailPath(locale, opportunity)}`,
    organizer: { "@type": "Organization", name: opportunity.vendor },
    offers: { "@type": "Offer", url: opportunity.registrationUrl, availability: "https://schema.org/InStock" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
