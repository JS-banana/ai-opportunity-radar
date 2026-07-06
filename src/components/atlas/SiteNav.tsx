"use client";

import Link from "next/link";
import { Icon } from "@/components/atlas/Icon";
import { copy } from "@/content/atlas-copy";
import type { Locale } from "@/i18n/locales";
import { formatSnapshotAge } from "@/lib/snapshot/format";

type SiteNavProps = {
  locale: Locale;
  active: "discover" | "categories";
  generatedAt?: string;
  isStale?: boolean;
};

export function SiteNav({ locale, active, generatedAt, isStale = false }: SiteNavProps) {
  const text = copy[locale];
  const otherLocale = locale === "zh" ? "en" : "zh";
  const dataAge = generatedAt ? text.dataUpdated.replace("{age}", formatSnapshotAge(generatedAt, locale)) : null;
  return (
    <header className="site-nav">
      <Link className="brand-mark" href={`/${locale}`}>
        <span className="atlas-logo" aria-hidden="true" />
        <b>AI Opportunity Atlas</b>
      </Link>
      <nav aria-label="Main navigation">
        <Link className={active === "discover" ? "active" : ""} href={`/${locale}`}>
          {text.nav[0]}
        </Link>
        <Link className={active === "categories" ? "active" : ""} href={`/${locale}/categories`}>
          {text.nav[1]}
        </Link>
        <Link href={`/${locale}/contact`}>{text.nav[2]}</Link>
        <Link href={`/${locale}/about`}>{text.nav[3]}</Link>
      </nav>
      <div className="nav-tools">
        {dataAge ? (
          <span style={{ color: "var(--muted)", fontSize: "12px", marginRight: "12px" }} title={isStale ? text.dataStale : undefined}>
            {dataAge}
            {isStale ? ` · ${text.dataStale}` : ""}
          </span>
        ) : null}
        <Link className="language-link" href={`/${otherLocale}`}>
          <Icon name="globe" />
          {locale.toUpperCase()}
          <Icon name="chevron" />
        </Link>
        <Link className="update-button" href={`/${locale}/contact`}>
          <Icon name="mail" />
          {text.update}
        </Link>
      </div>
    </header>
  );
}
