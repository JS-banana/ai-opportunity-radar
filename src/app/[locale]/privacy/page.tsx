import { notFound } from "next/navigation";
import { InfoPage } from "@/components/static/InfoPage";
import { isLocale, type Locale } from "@/i18n/locales";

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <InfoPage locale={locale as Locale} title={locale === "zh" ? "隐私" : "Privacy"}>
      <p>本站不提供账号系统，不建立用户画像，也不做重营销追踪。</p>
      <p>基础访问分析仅用于理解页面访问、筛选使用和官方入口点击情况。</p>
    </InfoPage>
  );
}
