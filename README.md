# AI 活动雷达 · AI Opportunity Radar

精选可报名的 AI 活动机会，在截止前找到值得参加的黑客松、积分、资助与挑战赛。

Curated AI hackathons, grants, credits and programs — before they close.

## What it is

A read-only discovery site for AI-related activity opportunities: hackathons, API credits, grants, competitions, and benefit programs. Data is synced from Feishu Base into a public snapshot; registration and submissions happen on official pages.

## Stack

- Next.js 15 (App Router) + SSR for list/detail pages
- Client-side search and filters on the discovery home
- Feishu Base → snapshot → Vercel Blob (optional)

## Development

```bash
pnpm install
pnpm dev
```

无 Feishu 凭证时，可先 `pnpm dump:snapshot -- --out tmp/snapshot.json` 生成本地快照，或依赖内置 seed 数据。

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Maintainer

Built by [Panionk](https://github.com/JS-banana) (孙小帅).
