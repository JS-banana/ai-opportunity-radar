"use client";

import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/atlas/Icon";
import { SearchBox } from "@/components/atlas/SearchBox";
import { SiteNav } from "@/components/atlas/SiteNav";
import { CategoryCard } from "@/components/discovery/CategoryCard";
import {
  emptyCategoryFilters,
  hasActiveCategoryFilters,
  matchesCategoryFilters,
  matchesOpportunitySearch,
} from "@/components/discovery/category-filters";
import { SmartFilterRibbon } from "@/components/discovery/SmartFilterRibbon";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
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

function matchesCategorySearch(category: (typeof categoryDefinitions)[number], query: string, locale: Locale) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = `${category.title[locale]} ${category.description[locale]} ${category.chips.join(" ")}`.toLowerCase();
  return haystack.includes(normalized);
}

export function CategoriesPage({ opportunities, locale, generatedAt, isStale = false }: CategoriesPageProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(emptyCategoryFilters);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const resultsRef = useRef<HTMLElement>(null);
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

  const selectedCategory = useMemo(
    () => categories.find((category) => category.title.en === selectedCategoryKey) ?? null,
    [categories, selectedCategoryKey],
  );

  const filteredCategories = useMemo(() => {
    return categories
      .filter((category) => {
        const rows = category.rows.filter((item) => matchesCategoryFilters(item, filters));
        if (rows.length === 0) return false;
        return matchesCategorySearch(category, query, locale);
      })
      .map((category) => {
        const rows = category.rows.filter((item) => matchesCategoryFilters(item, filters));
        return { ...category, rows, sample: rows[0] ?? category.sample };
      });
  }, [categories, filters, locale, query]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      if (!matchesCategoryFilters(item, filters)) return false;
      if (selectedCategory && !selectedCategory.match(item)) return false;
      if (!matchesOpportunitySearch(item, query)) return false;
      return true;
    });
  }, [filters, opportunities, query, selectedCategory]);

  const showResults =
    hasActiveCategoryFilters(filters) || selectedCategoryKey !== null || query.trim().length > 0;

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategoryKey((current) => (current === categoryKey ? null : categoryKey));
    scrollToResults();
  };

  const handleFiltersChange = (next: typeof filters) => {
    setFilters(next);
    if (hasActiveCategoryFilters(next)) scrollToResults();
  };

  const handleQueryChange = (next: string) => {
    setQuery(next);
    if (next.trim()) scrollToResults();
  };

  const clearSelection = () => {
    setSelectedCategoryKey(null);
    setFilters(emptyCategoryFilters);
    setQuery("");
  };

  const hasSelection =
    hasActiveCategoryFilters(filters) || selectedCategoryKey !== null || query.trim().length > 0;

  return (
    <main className="atlas-page categories-page">
      <SiteNav locale={locale} active="categories" generatedAt={generatedAt} isStale={isStale} />
      <section className="categories-shell">
        <div className="category-top">
          <div>
            <h1>{text.categoriesTitle}</h1>
            <p>{text.categoriesIntro}</p>
          </div>
          <SearchBox value={query} onChange={handleQueryChange} placeholder={text.searchCategories} compact shortcut />
        </div>

        <SmartFilterRibbon filters={filters} locale={locale} onChange={handleFiltersChange} />

        <div className="category-grid" id="categories">
          {filteredCategories.map((category) => (
            <CategoryCard
              category={category}
              key={category.title.en}
              locale={locale}
              onSelect={() => handleCategorySelect(category.title.en)}
              selected={selectedCategoryKey === category.title.en}
            />
          ))}
        </div>

        {showResults ? (
          <section className="category-results browse-state" id="category-results" ref={resultsRef}>
            <div className="section-heading all-heading">
              <div>
                <h2>{text.categoryResults}</h2>
                <p>
                  {filteredOpportunities.length.toLocaleString(locale === "zh" ? "zh-CN" : "en-US")} {text.results}
                  {selectedCategory ? ` · ${selectedCategory.title[locale]}` : null}
                </p>
              </div>
              {hasSelection ? (
                <button className="text-action category-clear" onClick={clearSelection} type="button">
                  {text.clearSelection}
                  <Icon name="spark" />
                </button>
              ) : null}
            </div>
            {filteredOpportunities.length === 0 ? (
              <p className="hero-copy">{text.noResults}</p>
            ) : (
              <div className="opportunity-grid">
                {filteredOpportunities.map((item, index) => (
                  <OpportunityCard item={item} index={index} key={item.id} locale={locale} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <p className="category-hint">{text.selectPathHint}</p>
        )}
      </section>
    </main>
  );
}
