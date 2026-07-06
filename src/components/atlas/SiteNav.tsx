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
        <b>{text.siteName}</b>
      </Link>
      <nav aria-label="Main navigation">
        <Link className={active === "discover" ? "active" : ""} href={`/${locale}`}>
          {text.nav[0]}
        </Link>
        <Link className={active === "categories" ? "active" : ""} href={`/${locale}/categories`}>
          {text.nav[1]}
        </Link>
      </nav>
      <div className="nav-tools">
        {dataAge ? (
          <span style={{ color: "var(--muted)", fontSize: "12px", marginRight: "12px" }} title={isStale ? text.dataStale : undefined}>
            {dataAge}
            {isStale ? ` · ${text.dataStale}` : ""}
          </span>
        ) : null}
        <a
          className="language-link"
          href="https://github.com/JS-banana/ai-opportunity-radar"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <Icon name="github" />
        </a>
        <Link className="language-link" href={`/${otherLocale}`}>
          <Icon name="globe" />
          {locale.toUpperCase()}
          <Icon name="chevron" />
        </Link>
      </div>
    </header>
  );
}
