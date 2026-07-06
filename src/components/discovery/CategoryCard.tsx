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
};

export function CategoryCard({ category, locale }: CategoryCardProps) {
  const text = copy[locale];
  const deadline = category.sample ? formatDate(category.sample.endAt, locale) : text.longTerm;
  return (
    <article className={category.index === 0 ? "category-card featured" : "category-card"}>
      <div className="category-image">
        <Image src={categoryImagePool[category.index % categoryImagePool.length]} alt="" fill sizes={category.index === 0 ? "48vw" : "24vw"} />
      </div>
      <div className="category-content">
        <span className="category-number">{String(category.index + 1).padStart(2, "0")}</span>
        {category.index === 0 ? <span className="type-tag">{locale === "zh" ? "精选路径" : "Featured path"}</span> : null}
        <button className="bookmark" type="button" aria-label="Save">
          <Icon name="bookmark" />
        </button>
        <h2>{category.title[locale]}</h2>
        <p>{category.description[locale]}</p>
        <small className="category-count">
          <Icon name="users" />
          {Math.max(category.rows.length, 1).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")} {locale === "zh" ? "个机会" : "opportunities"}
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
          <a href="#opportunities">
            {text.explore}
            <Icon name="arrow" />
          </a>
        </div>
      </div>
    </article>
  );
}
