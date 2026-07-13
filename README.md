# AI 活动雷达 · AI Opportunity Radar

精选可报名的 AI 活动机会，在截止前找到值得参加的黑客松、积分、资助与挑战赛。

Curated AI hackathons, grants, credits and programs — before they close.

**Live:** [https://airadar.laifuyou.com](https://airadar.laifuyou.com)

## What it is

A read-only discovery site for AI-related activity opportunities: hackathons, API credits, grants, competitions, and benefit programs. Data is synced from Feishu Base into a snapshot committed to this repo; registration happens on official pages (opened in a new tab).

## Stack

- Next.js 15 (App Router), fully static (SSG) via OpenNext
- Cloudflare Workers (`airadar`) for production hosting
- Feishu Base → GitHub Actions (twice daily) → `src/data/snapshot.json` → push triggers Workers deploy

## Development

```bash
pnpm install
pnpm dev
```

Data comes from the committed `src/data/snapshot.json`; no credentials are required for local browsing. To refresh the snapshot manually, copy `.env.example` to `.env`, fill in Feishu credentials, then run `pnpm sync:snapshot`.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Maintainer

Built by [Panionk](https://github.com/JS-banana) (孙小帅).
