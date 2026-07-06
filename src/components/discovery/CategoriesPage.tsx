"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/atlas/Icon";
import { SearchBox } from "@/components/atlas/SearchBox";
import { SiteNav } from "@/components/atlas/SiteNav";
import { CategoryCard } from "@/components/discovery/CategoryCard";
import { categoryDefinitions } from "@/content/category-definitions";
import { copy } from "@/content/atlas-copy";
import type { Locale } from "@/i18n/locales";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

type CategoriesPageProps = {
  opportunities: ActivityOpportunity[];
  locale: Locale;
  generatedAt?: string;
  isStale?: boolean;
};

const popularCombos = [
  {
    label: { en: "Online + API credits", zh: "线上 + API 积分" },
    icon: "globe" as const,
    match: (item: ActivityOpportunity) => /online/i.test(item.format ?? "") && item.rewardTypes.includes("api-credits"),
  },
  {
    label: { en: "Student + Prize", zh: "学生 + 奖金" },
    icon: "trophy" as const,
    match: (item: ActivityOpportunity) =>
      /student|residency|fellowship|scholarship/i.test(`${item.title} ${item.rewardDetail ?? ""}`) &&
      item.rewardTypes.includes("cash"),
  },
  {
    label: { en: "Global + Hackathon", zh: "全球 + 黑客松" },
    icon: "users" as const,
    match: (item: ActivityOpportunity) =>
      item.region === "global" && (item.type === "hackathon" || item.type === "dev-challenge"),
  },
  {
    label: { en: "Open source + Grant", zh: "开源 + 资助" },
    icon: "grid" as const,
    match: (item: ActivityOpportunity) =>
      /open.?source|开源/i.test(`${item.title} ${item.rewardDetail ?? ""} ${item.participation ?? ""}`) &&
      /grant|research|fund|资助/i.test(`${item.title} ${item.rewardSummary ?? ""} ${item.rewardDetail ?? ""}`),
  },
];

export function CategoriesPage({ opportunities, locale, generatedAt, isStale = false }: CategoriesPageProps) {
  const [query, setQuery] = useState("");
  const text = copy[locale];
  const categories = useMemo(
    () =>
      categoryDefinitions.map((category, index) => {
        const rows = opportunities.filter(category.match);
        const sample = rows[0] ?? opportunities[index % Math.max(opportunities.length, 1)];
        return { ...category, index, rows, sample };
      }),
    [opportunities],
  );
  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter((category) => {
      const haystack = `${category.title[locale]} ${category.description[locale]} ${category.chips.join(" ")}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [categories, locale, query]);
  const comboCounts = useMemo(
    () => popularCombos.map((combo) => ({ ...combo, count: opportunities.filter(combo.match).length })),
    [opportunities],
  );

  return (
    <main className="atlas-page categories-page">
      <SiteNav locale={locale} active="categories" generatedAt={generatedAt} isStale={isStale} />
      <section className="categories-shell">
        <div className="category-top">
          <div>
            <h1>{text.categoriesTitle}</h1>
            <p>{text.categoriesIntro}</p>
          </div>
          <SearchBox value={query} onChange={setQuery} placeholder={text.searchCategories} compact shortcut />
        </div>

        <div className="smart-filter-ribbon">
          <strong>{text.smartFilters}</strong>
          {text.filterNames.map((filter, index) => (
            <button key={filter} type="button">
              <Icon name={index === 0 ? "calendar" : index === 1 ? "grid" : index === 2 ? "gift" : index === 3 ? "globe" : "sliders"} />
              <span>{filter}</span>
              <small>{text.any[index]}</small>
              <Icon name="chevron" />
            </button>
          ))}
          <button className="reset-filter" type="button">
            {text.reset}
            <Icon name="spark" />
          </button>
        </div>

        <div className="category-grid">
          {filteredCategories.map((category) => (
            <CategoryCard category={category} key={category.title.en} locale={locale} />
          ))}
        </div>

        <div className="popular-band">
          <h2>{text.popular}</h2>
          {comboCounts.map((combo) => (
            <button className="combo-card" key={combo.label.en} type="button">
              <span className="combo-icon">
                <Icon name={combo.icon} />
              </span>
              <b>{combo.label[locale]}</b>
              <small>
                {combo.count.toLocaleString(locale === "zh" ? "zh-CN" : "en-US")} {locale === "zh" ? "个机会" : "opportunities"}
              </small>
              <Icon name="chevron" />
            </button>
          ))}
          <a className="text-action" href="#categories">
            {text.allCombinations}
            <Icon name="arrow" />
          </a>
        </div>
      </section>
    </main>
  );
}
