import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AtlasLanding } from "@/components/discovery/AtlasLanding";
import { isLocale, type Locale } from "@/i18n/locales";
import { detailPath } from "@/lib/opportunity/derive";
import { getActiveOpportunities } from "@/lib/page-data/getActiveOpportunities";
import { siteUrl } from "@/lib/site";

export const revalidate = 300;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const title = "AI Opportunity Atlas";
  const description =
    locale === "zh"
      ? "发现值得参加的 AI 活动、编程挑战、黑客松、积分和权益机会。"
      : "Curated AI events, programming challenges, hackathons, credits, benefits, and submission opportunities.";
  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        zh: `${siteUrl}/zh`,
        en: `${siteUrl}/en`,
        "x-default": `${siteUrl}/zh`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}`,
      type: "website",
    },
  };
}

export default async function LocaleHome({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { opportunities } = await getActiveOpportunities();

  const typedLocale = locale as Locale;

  return (
    <>
      <nav className="seo-opportunity-links" aria-label="Opportunity detail links">
        {opportunities.map((item) => (
          <Link key={item.id} href={detailPath(typedLocale, item)}>
            {item.title}
          </Link>
        ))}
      </nav>
      <AtlasLanding opportunities={opportunities} locale={typedLocale} />
    </>
  );
}
