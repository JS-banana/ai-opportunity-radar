"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/locales";
import { deadlineLabel, detailPath, formatDate, getDeadlineBucket } from "@/lib/opportunity/derive";
import { enumLabel } from "@/lib/opportunity/enums";
import type { ActivityOpportunity } from "@/lib/opportunity/model";

type AtlasLandingProps = {
  opportunities: ActivityOpportunity[];
  locale: Locale;
  snapshotGeneratedAt: string;
  isStale: boolean;
  source: string;
};

type IconName =
  | "arrow"
  | "bookmark"
  | "calendar"
  | "chevron"
  | "clock"
  | "filter"
  | "gift"
  | "globe"
  | "grid"
  | "mail"
  | "search"
  | "sliders"
  | "spark"
  | "trophy"
  | "users"
  | "verified";

const imagePool = [
  "/assets/event-pass-macro.png",
  "/assets/coding-workshop-duotone.png",
  "/assets/path-api-credits-card.png",
  "/assets/source-dossier-desk.png",
  "/assets/path-prize-envelope.png",
  "/assets/path-submission-stage.png",
  "/assets/hero-hackathon-overhead.png",
  "/assets/path-member-benefits-card.png",
  "/assets/detail-og-city-crop.png",
];

const categoryImagePool = [
  "/assets/hero-hackathon-overhead.png",
  "/assets/path-api-credits-card.png",
  "/assets/source-dossier-desk.png",
  "/assets/path-prize-envelope.png",
  "/assets/coding-workshop-duotone.png",
  "/assets/path-submission-stage.png",
  "/assets/event-pass-macro.png",
];

const copy = {
  en: {
    nav: ["Discover", "Categories", "Submit", "About"],
    update: "Get updates",
    eyebrow: "CURATED. TRUSTED. TIMELY.",
    title: "Find AI opportunities before they close.",
    intro: "Curated hackathons, credits, grants, and events from trusted sources.",
    search: "Search hackathons, credits, grants...",
    searchLong: "Search opportunities, e.g. hackathons, grants, API credits...",
    searchCategories: "Search categories or opportunities...",
    chips: ["All", "Ending soon", "New", "Online", "Prize", "API credits"],
    filters: ["All", "Ending soon", "Hackathons", "Grants", "API credits", "Online", "Prize"],
    closing: "Closing Soon",
    closingSmall: "Deadline Watch",
    closingSub: "Opportunities closing soon",
    all: "All opportunities",
    more: "View more opportunities",
    endingMore: "View all ending soon",
    recommended: "Recommended",
    results: "results",
    save: "Save",
    details: "Details",
    online: "Online",
    global: "Global",
    filtersButton: "Filters",
    categoriesTitle: "Browse by what you need next",
    categoriesIntro: "Choose a path, then refine by deadline, format, and reward.",
    smartFilters: "Smart filters",
    reset: "Reset",
    filterNames: ["Deadline", "Format", "Reward", "Region", "Skill level"],
    any: ["Any time", "Any format", "Any reward", "Any region", "Any level"],
    explore: "Explore path",
    nextDeadline: "Next deadline:",
    popular: "Popular combinations",
    allCombinations: "View all combinations",
    longTerm: "Long-term",
    verified: "verified",
  },
  zh: {
    nav: ["发现", "分类", "提交", "关于"],
    update: "获取更新",
    eyebrow: "精选 · 可信 · 及时",
    title: "在截止前找到 AI 机会。",
    intro: "精选黑客松、积分、资助、挑战和活动机会。",
    search: "搜索黑客松、积分、资助...",
    searchLong: "搜索机会，例如黑客松、资助、API 积分...",
    searchCategories: "搜索分类或机会...",
    chips: ["全部", "即将截止", "最新", "线上", "奖金", "API 积分"],
    filters: ["全部", "即将截止", "黑客松", "资助", "API 积分", "线上", "奖金"],
    closing: "即将截止",
    closingSmall: "Deadline Watch",
    closingSub: "近期截止机会",
    all: "全部机会",
    more: "查看更多机会",
    endingMore: "查看全部即将截止",
    recommended: "推荐排序",
    results: "条结果",
    save: "收藏",
    details: "详情",
    online: "线上",
    global: "全球",
    filtersButton: "筛选",
    categoriesTitle: "按下一步目标浏览",
    categoriesIntro: "选择路径，再按截止时间、参与形式和奖励继续筛选。",
    smartFilters: "智能筛选",
    reset: "重置",
    filterNames: ["截止时间", "形式", "奖励", "地区", "难度"],
    any: ["任意时间", "任意形式", "任意奖励", "任意地区", "任意难度"],
    explore: "查看路径",
    nextDeadline: "下一截止：",
    popular: "热门组合",
    allCombinations: "查看全部组合",
    longTerm: "长期开放",
    verified: "已验证",
  },
} as const;

const categoryDefinitions = [
  {
    title: { en: "Hackathons & build sprints", zh: "黑客松与构建冲刺" },
    description: { en: "Short, high-energy events to build, ship, and win.", zh: "短周期、高强度，适合组队构建和提交作品。" },
    chips: ["Build", "Team", "Prototype", "Pitch"],
    match: (item: ActivityOpportunity) => item.type === "hackathon" || item.type === "dev-challenge",
  },
  {
    title: { en: "API credits & cloud perks", zh: "API 积分与云资源" },
    description: { en: "Free API access, cloud credits, and developer tools.", zh: "API 调用、云资源和开发者权益。" },
    chips: ["API", "Cloud", "Credits", "Dev Tools"],
    match: (item: ActivityOpportunity) => item.rewardTypes.includes("api-credits"),
  },
  {
    title: { en: "Grants & research funding", zh: "资助与研究资金" },
    description: { en: "Funding for research, open science, and academic projects.", zh: "适合研究、开源、学术项目的资金支持。" },
    chips: ["Research", "Academic", "Funding", "Open Science"],
    match: (item: ActivityOpportunity) => item.type === "benefit" || /grant|research|fund/i.test(`${item.title} ${item.rewardSummary ?? ""}`),
  },
  {
    title: { en: "Prize challenges", zh: "奖金挑战" },
    description: { en: "Compete for cash prizes and public recognition.", zh: "面向奖金、排名和公开认可的挑战赛。" },
    chips: ["Prize", "Competition", "Leaderboard", "Cash"],
    match: (item: ActivityOpportunity) => item.rewardTypes.includes("cash") || item.type === "ai-competition",
  },
  {
    title: { en: "Startup programs", zh: "创业支持计划" },
    description: { en: "Incubators, accelerators, and founder support.", zh: "孵化器、加速器和创业者支持。" },
    chips: ["Startup", "Accelerator", "Mentorship", "Equity"],
    match: (item: ActivityOpportunity) => /startup|accelerator|loft|founder/i.test(`${item.title} ${item.rewardDetail ?? ""}`),
  },
  {
    title: { en: "Community events", zh: "社区活动" },
    description: { en: "Conferences, meetups, and AMAs to learn and connect.", zh: "会议、Meetup 和社区交流机会。" },
    chips: ["Meetup", "Conference", "AMA", "Networking"],
    match: (item: ActivityOpportunity) => /conference|meetup|summit|event/i.test(`${item.title} ${item.format ?? ""}`),
  },
  {
    title: { en: "Student opportunities", zh: "学生机会" },
    description: { en: "Scholarships, fellowships, and programs for students.", zh: "奖学金、研究项目和学生专项机会。" },
    chips: ["Student", "Fellowship", "Scholarship", "Learning"],
    match: (item: ActivityOpportunity) => /student|residency|fellowship|scholarship/i.test(`${item.title} ${item.rewardDetail ?? ""}`),
  },
] as const;

type CategoryDefinition = (typeof categoryDefinitions)[number];
type CategoryView = CategoryDefinition & {
  index: number;
  rows: ActivityOpportunity[];
  sample: ActivityOpportunity | undefined;
};

export function AtlasLanding({ opportunities, locale }: AtlasLandingProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>(copy[locale].filters[0]);
  const text = copy[locale];
  const visible = useFilteredOpportunities(opportunities, query, activeFilter, locale);
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
            {text.filters.map((filter) => (
              <button className={filter === activeFilter ? "chip selected" : "chip"} key={filter} onClick={() => setActiveFilter(filter)} type="button">
                {filter}
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

export function CategoriesPage({ opportunities, locale }: { opportunities: ActivityOpportunity[]; locale: Locale }) {
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

function SiteNav({ locale, active }: { locale: Locale; active: "discover" | "categories" }) {
  const text = copy[locale];
  const otherLocale = locale === "zh" ? "en" : "zh";
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

function SearchBox({ value, onChange, placeholder, compact = false, shortcut = false }: { value: string; onChange: (value: string) => void; placeholder: string; compact?: boolean; shortcut?: boolean }) {
  return (
    <label className={compact ? "search-box compact" : "search-box"}>
      <Icon name="search" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {shortcut ? <kbd>⌘ K</kbd> : null}
      {!compact ? (
        <button type="button">
          Search
          <Icon name="arrow" />
        </button>
      ) : null}
    </label>
  );
}

function DeadlinePill({ item, index, locale }: { item: ActivityOpportunity; index: number; locale: Locale }) {
  return (
    <article className="deadline-pill">
      <Image src={imageFor(item, index)} alt="" width={40} height={40} />
      <b>{item.title}</b>
      <DeadlineBadge item={item} locale={locale} />
    </article>
  );
}

function DeadlineCard({ item, index, locale }: { item: ActivityOpportunity; index: number; locale: Locale }) {
  return (
    <article className="deadline-card">
      <Image src={imageFor(item, index)} alt="" width={104} height={104} />
      <div>
        <h3>{item.title}</h3>
        <span className="type-tag">{enumLabel("type", item.type, locale)}</span>
        <p>
          {modeLabel(item, locale)} <span>·</span> {item.rewardSummary ?? enumLabel("type", item.type, locale)}
        </p>
      </div>
      <DeadlineBadge item={item} locale={locale} />
    </article>
  );
}

function OpportunityCard({ item, index, locale, large = false, lifted = false }: { item: ActivityOpportunity; index: number; locale: Locale; large?: boolean; lifted?: boolean }) {
  const text = copy[locale];
  return (
    <article className={["opportunity-card", large ? "large" : "", lifted ? "lifted" : ""].filter(Boolean).join(" ")}>
      <div className="card-media">
        <Image src={imageFor(item, index)} alt="" fill sizes={large ? "(min-width: 900px) 31vw, 100vw" : "(min-width: 900px) 30vw, 100vw"} />
        <button className="bookmark" type="button" aria-label={text.save}>
          <Icon name="bookmark" />
        </button>
      </div>
      <div className="card-body">
        <span className="type-tag">{enumLabel("type", item.type, locale)}</span>
        <h3>{item.title}</h3>
        <p className="vendor-line">
          {item.vendor}
          {item.officialStatus === "confirmed" ? <Icon name="verified" /> : null}
        </p>
        <div className="meta-line">
          <span>
            <Icon name="globe" />
            {modeLabel(item, locale)}
          </span>
          <span>
            <Icon name="calendar" />
            {formatDate(item.endAt, locale)}
          </span>
          <DeadlineBadge item={item} locale={locale} />
        </div>
        <p className="summary">{item.participation ?? item.timelineNotes ?? item.rewardDetail ?? item.rewardSummary}</p>
        <div className="reward-box">
          <Icon name={item.rewardTypes.includes("cash") ? "trophy" : "gift"} />
          <b>{item.rewardSummary ?? enumLabel("type", item.type, locale)}</b>
          <small>{item.estimatedEffort ?? enumLabel("official", item.officialStatus, locale)}</small>
        </div>
        <div className="card-footer">
          <span>{item.sourceChannel ?? item.vendor}</span>
          <Link href={detailPath(locale, item)}>{text.details}</Link>
        </div>
        {lifted ? (
          <div className="quick-actions">
            <button type="button">
              <Icon name="bookmark" />
              {text.save}
            </button>
            <Link href={detailPath(locale, item)}>
              {text.details}
              <Icon name="arrow" />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function CategoryCard({ category, locale }: { category: CategoryView; locale: Locale }) {
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

function DeadlineBadge({ item, locale }: { item: ActivityOpportunity; locale: Locale }) {
  const bucket = getDeadlineBucket(item.endAt);
  const label = deadlineLabel(item, locale);
  const text = locale === "zh" ? (bucket === "long-term" ? label : `${label}截止`) : bucket === "long-term" ? label : `Ends in ${label}`;
  return (
    <span className={bucket === "ending-3d" || bucket === "ending-7d" ? "deadline-badge urgent" : "deadline-badge"}>
      <Icon name="clock" />
      {text}
    </span>
  );
}

function Icon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true };
  const stroke = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "arrow") return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" {...stroke} /></svg>;
  if (name === "bookmark") return <svg {...common}><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.3L6 20V5a1 1 0 0 1 1-1Z" {...stroke} /></svg>;
  if (name === "calendar") return <svg {...common}><path d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" {...stroke} /></svg>;
  if (name === "chevron") return <svg {...common}><path d="m8 10 4 4 4-4" {...stroke} /></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="9" {...stroke} /><path d="M12 7v5l3 2" {...stroke} /></svg>;
  if (name === "filter") return <svg {...common}><path d="M4 6h16M7 12h10M10 18h4" {...stroke} /></svg>;
  if (name === "gift") return <svg {...common}><path d="M20 12v8H4v-8M3 8h18v4H3zM12 8v12M12 8H8.5A2.5 2.5 0 1 1 11 5.5L12 8Zm0 0h3.5A2.5 2.5 0 1 0 13 5.5L12 8Z" {...stroke} /></svg>;
  if (name === "globe") return <svg {...common}><circle cx="12" cy="12" r="9" {...stroke} /><path d="M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9S14.4 18.4 12 21M12 3C9.6 5.6 8.4 8.6 8.4 12S9.6 18.4 12 21" {...stroke} /></svg>;
  if (name === "grid") return <svg {...common}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" {...stroke} /></svg>;
  if (name === "mail") return <svg {...common}><path d="M4 6h16v12H4z" {...stroke} /><path d="m4 7 8 6 8-6" {...stroke} /></svg>;
  if (name === "search") return <svg {...common}><circle cx="10.5" cy="10.5" r="6.5" {...stroke} /><path d="m16 16 5 5" {...stroke} /></svg>;
  if (name === "sliders") return <svg {...common}><path d="M4 7h7M15 7h5M13 5v4M4 17h5M13 17h7M11 15v4" {...stroke} /></svg>;
  if (name === "spark") return <svg {...common}><path d="m12 3 1.8 5 5.2 1.9-5.2 1.9L12 17l-1.8-5.2L5 9.9 10.2 8 12 3ZM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16Z" {...stroke} /></svg>;
  if (name === "trophy") return <svg {...common}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM5 6H3v2a4 4 0 0 0 4 4M19 6h2v2a4 4 0 0 1-4 4" {...stroke} /></svg>;
  if (name === "users") return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM21 21v-2a3.5 3.5 0 0 0-3-3.5M18 4.2a3.5 3.5 0 0 1 0 6.6" {...stroke} /></svg>;
  return <svg {...common}><path d="m12 2 2.1 2.5 3.2-.2.8 3.1 2.7 1.7-1.3 2.9 1.3 2.9-2.7 1.7-.8 3.1-3.2-.2L12 22l-2.1-2.5-3.2.2-.8-3.1-2.7-1.7L4.5 12 3.2 9.1l2.7-1.7.8-3.1 3.2.2L12 2Z" {...stroke} /><path d="m8.7 12 2.1 2.1 4.5-4.8" {...stroke} /></svg>;
}

function useFilteredOpportunities(opportunities: ActivityOpportunity[], query: string, activeFilter: string, locale: Locale) {
  return useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return opportunities.filter((item) => {
      const haystack = `${item.title} ${item.vendor} ${item.rewardSummary ?? ""} ${item.rewardDetail ?? ""}`.toLowerCase();
      if (normalized && !haystack.includes(normalized)) return false;
      if (activeFilter === copy[locale].filters[1]) return ["ending-3d", "ending-7d"].includes(getDeadlineBucket(item.endAt));
      if (activeFilter === copy[locale].filters[2]) return item.type === "hackathon" || item.type === "dev-challenge";
      if (activeFilter === copy[locale].filters[3]) return /grant|research|fund/i.test(`${item.title} ${item.rewardSummary ?? ""} ${item.rewardDetail ?? ""}`);
      if (activeFilter === copy[locale].filters[4]) return item.rewardTypes.includes("api-credits");
      if (activeFilter === copy[locale].filters[5]) return /online/i.test(item.format ?? "");
      if (activeFilter === copy[locale].filters[6]) return item.rewardTypes.includes("cash");
      return true;
    });
  }, [activeFilter, locale, opportunities, query]);
}

function imageFor(item: ActivityOpportunity, index: number) {
  if (item.type === "hackathon") return "/assets/event-pass-macro.png";
  if (item.rewardTypes.includes("api-credits")) return "/assets/path-api-credits-card.png";
  if (item.rewardTypes.includes("cash")) return "/assets/path-prize-envelope.png";
  if (item.type === "benefit") return "/assets/path-member-benefits-card.png";
  return imagePool[index % imagePool.length];
}

function modeLabel(item: ActivityOpportunity, locale: Locale) {
  if (item.format && /online/i.test(item.format)) return copy[locale].online;
  return enumLabel("region", item.region, locale) || copy[locale].global;
}

function deadlineSort(item: ActivityOpportunity) {
  if (!item.endAt) return Number.MAX_SAFE_INTEGER;
  return new Date(item.endAt).getTime();
}
