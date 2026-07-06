import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoriesPage } from "@/components/discovery/CategoriesPage";
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
  const title = locale === "zh" ? "分类浏览 | AI Opportunity Atlas" : "Categories | AI Opportunity Atlas";
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

  const { opportunities } = await getActiveOpportunities();

  return <CategoriesPage opportunities={opportunities} locale={locale as Locale} />;
}
