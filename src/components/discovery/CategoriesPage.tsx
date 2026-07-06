"use client";

import { useState } from "react";
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
};

export function CategoriesPage({ opportunities, locale }: CategoriesPageProps) {
  const [query, setQuery] = useState("");
  const text = copy[locale];
  const categories = categoryDefinitions.map((category, index) => {
    const rows = opportunities.filter(category.match);
    const sample = rows[0] ?? opportunities[index % Math.max(opportunities.length, 1)];
    return { ...category, index, rows, sample };
  });

  return (
    <main className="atlas-page categories-page">
      <SiteNav locale={locale} active="categories" />
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
          {categories.map((category) => (
            <CategoryCard category={category} key={category.title.en} locale={locale} />
          ))}
        </div>

        <div className="popular-band">
          <h2>{text.popular}</h2>
          {[
            ["Online + API credits", "842"],
            ["Student + Prize", "693"],
            ["Global + Hackathon", "1,205"],
            ["Open source + Grant", "514"],
          ].map(([label, count], index) => (
            <button className="combo-card" key={label} type="button">
              <span className="combo-icon">
                <Icon name={index === 0 ? "globe" : index === 1 ? "trophy" : index === 2 ? "users" : "grid"} />
              </span>
              <b>{label}</b>
              <small>
                {count} {locale === "zh" ? "个机会" : "opportunities"}
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
