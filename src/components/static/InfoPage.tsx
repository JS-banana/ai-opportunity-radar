import Link from "next/link";
import type { Locale } from "@/i18n/locales";

type InfoPageProps = {
  locale: Locale;
  title: string;
  children: React.ReactNode;
};

export function InfoPage({ locale, title, children }: InfoPageProps) {
  return (
    <main className="info-page">
      <nav className="info-nav">
        <Link href={`/${locale}`}>AI Opportunity Atlas</Link>
        <span />
        <Link href={`/${locale}/about`}>About</Link>
        <Link href={`/${locale}/contact`}>Contact</Link>
        <Link href={`/${locale}/privacy`}>Privacy</Link>
        <Link href={`/${locale}/terms`}>Terms</Link>
      </nav>
      <article>
        <h1>{title}</h1>
        {children}
      </article>
    </main>
  );
}
