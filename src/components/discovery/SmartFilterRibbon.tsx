"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/atlas/Icon";
import {
  CATEGORY_FILTER_KEYS,
  categoryFilterOptions,
  emptyCategoryFilters,
  getFilterIcon,
  getFilterValueLabel,
  hasActiveCategoryFilters,
  type CategoryFilterKey,
  type CategoryFilterState,
} from "@/components/discovery/category-filters";
import { copy } from "@/content/atlas-copy";
import type { Locale } from "@/i18n/locales";

type SmartFilterRibbonProps = {
  locale: Locale;
  filters: CategoryFilterState;
  onChange: (filters: CategoryFilterState) => void;
};

export function SmartFilterRibbon({ locale, filters, onChange }: SmartFilterRibbonProps) {
  const text = copy[locale];
  const [openKey, setOpenKey] = useState<CategoryFilterKey | null>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openKey) return;
    const close = (event: MouseEvent) => {
      if (!ribbonRef.current?.contains(event.target as Node)) setOpenKey(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenKey(null);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [openKey]);

  const setFilter = (key: CategoryFilterKey, value: string) => {
    onChange({ ...filters, [key]: value });
    setOpenKey(null);
  };

  return (
    <div className="smart-filter-ribbon" ref={ribbonRef}>
      <strong>{text.smartFilters}</strong>
      {CATEGORY_FILTER_KEYS.map((key, index) => {
        const value = filters[key];
        const isOpen = openKey === key;
        return (
          <div className="smart-filter-cell" key={key}>
            <button
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              className={isOpen ? "filter-trigger open" : "filter-trigger"}
              onClick={() => setOpenKey(isOpen ? null : key)}
              type="button"
            >
              <Icon name={getFilterIcon(key)} />
              <span className="filter-label-group">
                <span className="filter-name">{text.filterNames[index]}</span>
                <small>{getFilterValueLabel(key, value, locale)}</small>
              </span>
              <Icon name="chevron" />
            </button>
            {isOpen ? (
              <ul className="filter-menu" role="listbox">
                {categoryFilterOptions[key].map((option) => (
                  <li key={option.value}>
                    <button
                      aria-selected={option.value === value}
                      className={option.value === value ? "selected" : undefined}
                      onClick={() => setFilter(key, option.value)}
                      role="option"
                      type="button"
                    >
                      {option.label[locale]}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
      <button
        className="reset-filter"
        disabled={!hasActiveCategoryFilters(filters)}
        onClick={() => onChange(emptyCategoryFilters)}
        type="button"
      >
        {text.reset}
        <Icon name="spark" />
      </button>
    </div>
  );
}
