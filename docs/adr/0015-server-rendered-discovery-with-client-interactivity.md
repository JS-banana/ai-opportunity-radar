# Server-rendered discovery with client interactivity

Amends ADR 0006. Client-side discovery alone conflicts with the SEO readiness goals in ADR 0012: if the list page is an empty shell hydrated from a fetched snapshot, crawlers see no content and no internal links to detail pages, which also breaks the no-sitemap discovery strategy.

The list page and detail pages are server-rendered from the same snapshot (React Server Components with ISR or cache headers), so the initial HTML contains real content and links to every non-expired detail page. The full snapshot data is delivered to the browser through the server render — not a second client fetch — and interactive search, filtering, sorting, tags, and deadline buckets then run entirely in the browser over that data, preserving the intent of ADR 0006. Detail pages serialize only their own record, not the full snapshot.
