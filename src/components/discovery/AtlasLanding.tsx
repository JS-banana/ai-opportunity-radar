"use client";

import { useState } from "react";
import { Icon } from "@/components/atlas/Icon";
import { SearchBox } from "@/components/atlas/SearchBox";
import { SiteNav } from "@/components/atlas/SiteNav";
import { useOpportunityFilters, type OpportunityFilterKey } from "@/components/discovery/useOpportunityFilters";
import { DeadlineCard } from "@/components/opportunity/DeadlineWidgets";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
import { deadlineSort } from "@/components/opportunity/card-helpers";
import { copy, HERO_CHIP_KEYS } from "@/content/atlas-copy";
import type { Locale } from "@/i18n/locales";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

type AtlasLandingProps = {
  opportunities: ActivityOpportunity[];
  locale: Locale;
  generatedAt?: string;
  isStale?: boolean;
};

export function AtlasLanding({ opportunities, locale, generatedAt, isStale = false }: AtlasLandingProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<OpportunityFilterKey>("all");
  const text = copy[locale];
  const visible = useOpportunityFilters(opportunities, query, activeFilter);
  const closingSoon = [...opportunities].sort((a, b) => deadlineSort(a) - deadlineSort(b)).slice(0, 4);

  return (
    <main className="atlas-page">
      <SiteNav locale={locale} active="discover" generatedAt={generatedAt} isStale={isStale} />
      <section className="home-hero" id="discover">
        <div className="hero-grid-bg" />
        <div className="hero-inner">
          <h1>{text.title}</h1>
          <p className="hero-copy">{text.intro}</p>
          <SearchBox value={query} onChange={setQuery} placeholder={text.search} />
          <div className="chip-row hero-chips">
            {text.chips.map((chip, index) => {
              const key = HERO_CHIP_KEYS[index];
              return (
                <button
                  className={key === activeFilter ? "chip selected" : "chip"}
                  key={chip}
                  onClick={() => setActiveFilter(key)}
                  type="button"
                >
                  {index === 1 ? <span className="amber-dot" /> : null}
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="browse-state" id="opportunities">
        <div className="live-index" aria-hidden="true">
          <span />
          <b>LIVE INDEX</b>
        </div>

        <div className="section-heading deadline-heading" id="deadline-watch">
          <div className="section-heading-label">
            <Icon name="clock" />
            <div>
              <h2>{text.closing}</h2>
            </div>
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
              {visible.length} {text.results}
            </p>
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="hero-copy">{text.noResults}</p>
        ) : (
          <div className="opportunity-grid">
            {visible.map((item, index) => (
              <OpportunityCard item={item} index={index} key={item.id} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
