import { notFound } from "next/navigation";
import { InfoPage } from "@/components/static/InfoPage";
import { isLocale, type Locale } from "@/i18n/locales";

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <InfoPage locale={locale as Locale} title={locale === "zh" ? "联系" : "Contact"}>
      <p>如需反馈活动信息、修正链接或联系网站维护者，请通过公开联系方式提交说明。</p>
      <p>第一版不提供活动提交表单，避免把采集和审核流程移出既有 source of truth。</p>
    </InfoPage>
  );
}
