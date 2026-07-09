import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { isLocale, locales, type Locale } from "@/i18n/locales";
import { messagesFor } from "@/i18n/messages";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // 静态渲染必需：不调用会让 next-intl 读请求配置，把整棵 [locale] 树拖成动态。
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messagesFor(locale as Locale)}>
      {children}
    </NextIntlClientProvider>
  );
}
