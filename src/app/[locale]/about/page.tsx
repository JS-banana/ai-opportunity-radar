import { notFound } from "next/navigation";
import { InfoPage } from "@/components/static/InfoPage";
import { copy } from "@/content/atlas-copy";
import { isLocale, type Locale } from "@/i18n/locales";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <InfoPage locale={locale as Locale} title={locale === "zh" ? "关于" : "About"}>
      <p>{copy[locale as Locale].siteName} 展示已整理的 AI 活动、编程挑战、黑客松、积分和权益机会，帮助用户判断是否值得参加。</p>
      <p>数据来自维护中的只读机会快照，源头仍是 Feishu Base。</p>
    </InfoPage>
  );
}
