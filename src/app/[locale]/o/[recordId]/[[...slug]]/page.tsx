import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    title: `${opportunity.title} | AI Opportunity Atlas`,
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
  const status = publicStatusLabel(getPublicStatus(opportunity.endAt), locale);

  return (
    <main className="opportunity-detail-page">
      {shouldEmitEventJsonLd(opportunity) ? <JsonLd opportunity={opportunity} locale={locale} /> : null}
      <nav className="detail-nav">
        <Link href={`/${locale}`}>AI Opportunity Atlas</Link>
        <Link href={`/${locale}`}>Discovery</Link>
        <Link href={`/go/${opportunity.id}`}>Official entry</Link>
      </nav>
      <article className="detail-document">
        <div className="detail-kicker">{enumLabel("type", opportunity.type, locale)} / {status}</div>
        <h1>{opportunity.title}</h1>
        <p className="detail-vendor">{opportunity.vendor}</p>
        <div className="detail-actions">
          <Link className="primary-button compact" href={`/go/${opportunity.id}`}>Enter official page</Link>
          <span>{enumLabel("official", opportunity.officialStatus, locale)}</span>
        </div>
        <dl className="detail-facts">
          <div><dt>Score</dt><dd>{opportunity.score} / 5</dd></div>
          <div><dt>Deadline</dt><dd>{formatDate(opportunity.endAt, locale)}</dd></div>
          <div><dt>Region</dt><dd>{enumLabel("region", opportunity.region, locale)}</dd></div>
          <div><dt>Difficulty</dt><dd>{opportunity.difficulty ?? "-"} / 5</dd></div>
        </dl>
        <DetailSection title="Reward / 奖励" content={opportunity.rewardDetail ?? opportunity.rewardSummary} locale={locale} />
        <DetailSection title="Participation / 参与方式" content={opportunity.participation} locale={locale} />
        <DetailSection title="Winning criteria / 获奖条件" content={opportunity.winningCriteria} locale={locale} />
        <DetailSection title="Timeline / 时间节点" content={opportunity.timelineNotes} locale={locale} />
        <footer className="detail-footer">
          <span>Source: {opportunity.sourceChannel ?? "Maintained record"}</span>
          <span>Discovered: {formatDate(opportunity.discoveredAt, locale)}</span>
        </footer>
      </article>
    </main>
  );
}

function DetailSection({ title, content, locale }: { title: string; content: string | null; locale: Locale }) {
  if (!content) return null;
  return (
    <section className="detail-section">
      <h2>{title}</h2>
      <p lang={locale === "en" ? "zh" : undefined}>{content}</p>
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
