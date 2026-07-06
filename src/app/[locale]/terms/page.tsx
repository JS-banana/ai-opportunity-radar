import { notFound } from "next/navigation";
import { InfoPage } from "@/components/static/InfoPage";
import { isLocale, type Locale } from "@/i18n/locales";

type Props = { params: Promise<{ locale: string }> };

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <InfoPage locale={locale as Locale} title={locale === "zh" ? "条款" : "Terms"}>
      <p>本站仅展示活动机会信息。报名、提交、参赛、权益领取等流程均在官方活动页面完成。</p>
      <p>信息可能随官方页面更新而变化，参与前请以官方页面为准。</p>
    </InfoPage>
  );
}
