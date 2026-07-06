import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoriesPage } from "@/components/discovery/CategoriesPage";
import { copy } from "@/content/atlas-copy";
import { isLocale, type Locale } from "@/i18n/locales";
import { getActiveOpportunities } from "@/lib/page-data/getActiveOpportunities";
import { siteUrl } from "@/lib/site";

export const revalidate = 300;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const siteName = copy[locale].siteName;
  const title = locale === "zh" ? `分类浏览 | ${siteName}` : `Categories | ${siteName}`;
  const description =
    locale === "zh"
      ? "按目标浏览 AI 黑客松、API 积分、奖金挑战、创业计划和学生机会。"
      : "Browse AI hackathons, API credits, prize challenges, startup programs, and student opportunities by goal.";
  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/categories`,
      languages: {
        zh: `${siteUrl}/zh/categories`,
        en: `${siteUrl}/en/categories`,
      },
    },
  };
}

export default async function LocaleCategories({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { opportunities, snapshot, isStale } = await getActiveOpportunities();

  return (
    <CategoriesPage
      opportunities={opportunities}
      locale={locale as Locale}
      generatedAt={snapshot.generatedAt}
      isStale={isStale}
    />
  );
}
