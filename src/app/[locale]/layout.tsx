import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { isLocale, type Locale } from "@/i18n/locales";
import { messagesFor } from "@/i18n/messages";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <NextIntlClientProvider locale={locale} messages={messagesFor(locale as Locale)}>
      {children}
    </NextIntlClientProvider>
  );
}
