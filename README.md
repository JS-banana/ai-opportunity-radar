# AI 活动雷达 · AI Opportunity Radar

精选可报名的 AI 活动机会，在截止前找到值得参加的黑客松、积分、资助与挑战赛。

Curated AI hackathons, grants, credits and programs — before they close.

## What it is

A read-only discovery site for AI-related activity opportunities: hackathons, API credits, grants, competitions, and benefit programs. Data is synced from Feishu Base into a snapshot committed to this repo; registration and submissions happen on official pages.

Live: [https://airadar.laifuyou.com](https://airadar.laifuyou.com)

## Stack

- Next.js 15 (App Router) + SSR for list/detail pages
- Client-side search and filters on the discovery home
- Feishu Base → GitHub Actions（每天两次）→ `src/data/snapshot.json` → git push 触发 Vercel 部署

## Development

```bash
pnpm install
pnpm dev
```

数据直接来自仓库内 `src/data/snapshot.json`，本地开发无需任何凭证。需要手动刷新数据时，在 `.env` 配置 Feishu 凭证后执行 `pnpm sync:snapshot`。

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Maintainer

Built by [Panionk](https://github.com/JS-banana) (孙小帅).
