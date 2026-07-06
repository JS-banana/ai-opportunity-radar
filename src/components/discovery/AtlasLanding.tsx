"use client";

import { useState } from "react";
import { Icon } from "@/components/atlas/Icon";
import { SearchBox } from "@/components/atlas/SearchBox";
import { SiteNav } from "@/components/atlas/SiteNav";
import { useOpportunityFilters } from "@/components/discovery/useOpportunityFilters";
import { DeadlineCard, DeadlinePill } from "@/components/opportunity/DeadlineWidgets";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
import { deadlineSort } from "@/components/opportunity/card-helpers";
import { copy, FILTER_KEYS, type FilterKey } from "@/content/atlas-copy";
import type { Locale } from "@/i18n/locales";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

type AtlasLandingProps = {
  opportunities: ActivityOpportunity[];
  locale: Locale;
};

export function AtlasLanding({ opportunities, locale }: AtlasLandingProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const text = copy[locale];
  const visible = useOpportunityFilters(opportunities, query, activeFilter);
  const fallbackRows = visible.length ? visible : opportunities;
  const closingSoon = [...opportunities].sort((a, b) => deadlineSort(a) - deadlineSort(b)).slice(0, 4);
  const topCards = fallbackRows.slice(0, 6);

  return (
    <main className="atlas-page">
      <SiteNav locale={locale} active="discover" />
      <section className="home-hero" id="discover">
        <div className="hero-grid-bg" />
        <div className="hero-inner">
          <p className="hero-eyebrow">{text.eyebrow}</p>
          <h1>{text.title}</h1>
          <p className="hero-copy">{text.intro}</p>
          <SearchBox value={query} onChange={setQuery} placeholder={text.search} />
          <div className="chip-row hero-chips">
            {text.chips.map((chip) => (
              <button className={chip === text.chips[0] ? "chip selected" : "chip"} key={chip} type="button">
                {chip === text.chips[1] ? <span className="amber-dot" /> : null}
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-band" aria-labelledby="closing-title">
        <div className="closing-label">
          <Icon name="clock" />
          <h2 id="closing-title">{text.closing}</h2>
        </div>
        <div className="closing-items">
          {closingSoon.slice(0, 2).map((item, index) => (
            <DeadlinePill item={item} index={index} key={item.id} locale={locale} />
          ))}
        </div>
        <a className="text-action" href="#deadline-watch">
          {text.endingMore}
          <Icon name="arrow" />
        </a>
      </section>

      <section className="hero-cards" aria-label={text.all}>
        {topCards.slice(0, 3).map((item, index) => (
          <OpportunityCard item={item} index={index} key={item.id} locale={locale} large />
        ))}
      </section>

      <section className="browse-state" id="opportunities">
        <div className="live-index" aria-hidden="true">
          <span />
          <b>LIVE INDEX</b>
        </div>
        <div className="command-bar">
          <SearchBox value={query} onChange={setQuery} placeholder={text.searchLong} compact />
          <button className="select-button" type="button">
            {text.recommended}
            <Icon name="chevron" />
          </button>
          <div className="filter-chip-row">
            {FILTER_KEYS.map((key) => (
              <button className={key === activeFilter ? "chip selected" : "chip"} key={key} onClick={() => setActiveFilter(key)} type="button">
                {text.filters[key]}
              </button>
            ))}
          </div>
          <button className="select-button filters" type="button">
            <Icon name="sliders" />
            {text.filtersButton}
          </button>
        </div>

        <div className="section-heading" id="deadline-watch">
          <div>
            <h2>{text.closingSmall}</h2>
            <p>{text.closingSub}</p>
          </div>
        </div>
        <div className="deadline-grid">
          {closingSoon.map((item, index) => (
            <DeadlineCard item={item} index={index} key={item.id} locale={locale} />
          ))}
        </div>

        <div className="section-heading all-heading">
          <div>
            <h2>{text.all}</h2>
            <p>
              {fallbackRows.length} {text.results}
            </p>
          </div>
        </div>
        <div className="opportunity-grid">
          {topCards.map((item, index) => (
            <OpportunityCard item={item} index={index + 3} key={item.id} locale={locale} lifted={index === 1} />
          ))}
        </div>
      </section>
    </main>
  );
}
