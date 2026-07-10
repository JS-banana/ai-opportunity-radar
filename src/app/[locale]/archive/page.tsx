import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/atlas/SiteNav";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
import { copy } from "@/content/atlas-copy";
import { isLocale, type Locale } from "@/i18n/locales";
import { getDeadlineBucket } from "@/lib/opportunity/derive";
import { getSnapshot } from "@/lib/snapshot/get";
import { siteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const text = copy[locale];
  const title = `${text.archive.title} | ${text.siteName}`;
  return {
    title,
    description: text.archive.intro,
    alternates: {
      canonical: `${siteUrl}/${locale}/archive`,
      languages: {
        zh: `${siteUrl}/zh/archive`,
        en: `${siteUrl}/en/archive`,
        "x-default": `${siteUrl}/zh/archive`,
      },
    },
  };
}

export default async function ArchivePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const text = copy[typedLocale];

  const { snapshot, isStale } = await getSnapshot();
  const expired = snapshot.opportunities
    .filter((item) => getDeadlineBucket(item.endAt) === "expired")
    .sort((a, b) => new Date(b.endAt ?? 0).getTime() - new Date(a.endAt ?? 0).getTime());

  return (
    <main className="atlas-page">
      <SiteNav locale={typedLocale} active="archive" generatedAt={snapshot.generatedAt} isStale={isStale} />
      <section className="browse-state">
        <div className="section-heading all-heading">
          <div>
            <h1>{text.archive.title}</h1>
            <p>{text.archive.intro}</p>
            <p>
              {expired.length} {text.archive.count}
            </p>
          </div>
        </div>
        {expired.length === 0 ? (
          <p className="hero-copy">{text.archive.empty}</p>
        ) : (
          <div className="opportunity-grid">
            {expired.map((item, index) => (
              <OpportunityCard item={item} index={index} key={item.id} locale={typedLocale} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
