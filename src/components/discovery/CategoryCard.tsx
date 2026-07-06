"use client";

import Image from "next/image";
import { Icon } from "@/components/atlas/Icon";
import type { CategoryDefinition } from "@/content/category-definitions";
import { categoryImagePool } from "@/content/category-definitions";
import { copy } from "@/content/atlas-copy";
import type { Locale } from "@/i18n/locales";
import { formatDate } from "@/lib/opportunity/derive";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

export type CategoryView = CategoryDefinition & {
  index: number;
  rows: ActivityOpportunity[];
  sample: ActivityOpportunity | undefined;
};

type CategoryCardProps = {
  category: CategoryView;
  locale: Locale;
  selected?: boolean;
  onSelect?: () => void;
};

export function CategoryCard({ category, locale, selected = false, onSelect }: CategoryCardProps) {
  const text = copy[locale];
  const deadline = category.sample ? formatDate(category.sample.endAt, locale) : text.longTerm;
  const className = [
    "category-card",
    category.index === 0 ? "featured" : "",
    selected ? "selected" : "",
    onSelect ? "interactive" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      aria-pressed={onSelect ? selected : undefined}
      className={className}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div className="category-image">
        <Image src={categoryImagePool[category.index % categoryImagePool.length]} alt="" fill sizes={category.index === 0 ? "48vw" : "24vw"} />
      </div>
      <div className="category-content">
        <span className="category-number">{String(category.index + 1).padStart(2, "0")}</span>
        {category.index === 0 ? <span className="type-tag">{locale === "zh" ? "精选路径" : "Featured path"}</span> : null}
        <button
          className="bookmark"
          type="button"
          aria-label="Save"
          onClick={(event) => event.stopPropagation()}
        >
          <Icon name="bookmark" />
        </button>
        <h2>{category.title[locale]}</h2>
        <p>{category.description[locale]}</p>
        <small className="category-count">
          <Icon name="users" />
          {category.rows.length.toLocaleString(locale === "zh" ? "zh-CN" : "en-US")} {locale === "zh" ? "个机会" : "opportunities"}
        </small>
        <div className="mini-chip-row">
          {category.chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
        <div className="category-footer">
          <span>
            <Icon name="calendar" />
            {text.nextDeadline} <b>{deadline}</b>
          </span>
          <span className="category-action">
            {text.explore}
            <Icon name="arrow" />
          </span>
        </div>
      </div>
    </article>
  );
}
