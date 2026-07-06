# Implementation Tracker

ADRs 记录架构决策；本文只记录当前执行状态和下一步任务。

## Locked Decisions

- 路由：`/` → `/zh`；`/{locale}` 是发现首页；`/{locale}/categories` 是分类浏览；`/{locale}/o/{recordId}/{slug}` 是详情；`/go/{recordId}` 是 outbound。
- UI：已接受的高保真方向以 `docs/design/references/v2-*.png` 为准；当前实现为自有 React 组件 + 全局 CSS，Tailwind v4 只作为可用基础，不再回退到临时样式。
- 数据：Feishu Base + 派生 snapshot 是 UI 的真实数据源；`seedSnapshot` 只用于未配置凭证时的开发 fallback。
- 维护：Feishu/Base/skill 负责采集、审核、维护；网站只读展示。

## Current UI Status

| Area | Status | Notes |
|---|---|---|
| 首页首屏 | Done | hero、搜索、chip、Closing Soon、首屏卡片已按 v2 参考实现。 |
| 首页浏览区 | Done | sticky 筛选条、Deadline Watch、机会卡片网格、基础搜索和筛选已实现。 |
| 分类页 | Done | `/[locale]/categories` 已实现，作为顶层分类浏览界面，不生成每个 tag 的独立页。 |
| 详情页 | Functional | 可展示快照记录和官方入口；视觉仍是文档式页面，等真实数据字段确认后再做精修。 |
| 静态页 | Functional | About / Contact / Privacy / Terms 可访问，用于 SEO/AdSense 前置。 |
| 响应式 | Done for MVP | desktop 与 mobile 已跑过截图检查；后续跟真实数据长度再调。 |

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| Phase 0 — Live data verification | Done | `.env` 四元组齐全；`dump:snapshot` 成功：`fields: 22`、`records: 61`、`skipped: 0`、gzip 前 JSON 73,949 bytes（&lt; 500KB）。 |
| Phase 1 — Core product link | Done | 发现页全量网格、chip 筛选、空结果 UX、分类页搜索与真实计数、stale 数据时间展示已接线；详情/outbound/SWR/lib tests 已有。live enum 已对账；`tests/live-snapshot.test.ts` + 生产构建 spot-check 已用 61 条真实快照验收（50 active / 11 expired）。 |
| Phase 2 — SEO / bilingual | In progress | metadata、hreflang、robots、sitemap、JSON-LD gate、静态政策页已存在；copy 和详情页结构仍可根据真实内容优化。 |
| Phase 3 — Launch | Pending | 域名、Search Console、生产 analytics、Vercel Blob token、日志验证未做。 |

## Next Task Plan

1. 部署侧配置 `BLOB_READ_WRITE_TOKEN`，验证 Blob 读写与 SWR 后台刷新（用户明确暂缓）。
2. 域名、Search Console、生产 analytics 等 Phase 3 上线项。
3. 可选：首页筛选状态同步到 URL query（build spec §8，非 MVP 阻塞）。

## 2026-07-06 验收记录

| 检查项 | 结果 |
|---|---|
| `pnpm lint` / `test` / `typecheck` / `build` | 全部通过（含 `live-snapshot` 集成测试，需先 `dump:snapshot`） |
| `pnpm dump:snapshot` | **成功** — `fields: 22`、`records: 61`、`skipped: 0`、JSON 73,949 bytes / gzip ~16.7KB |
| mapper-enum-reconcile | **完成** — live Base 枚举全覆盖 |
| e2e-verification | **完成** — `/zh` SEO 隐藏链接 50 条；`/zh/categories`、详情、`/go/{id}` 302 到官方 URL；metadata/JSON-LD 正常 |
| prod-blob-verify | **跳过** — 用户要求暂缓 Blob/Vercel 部署 |

## Verification Commands

```bash
pnpm lint
pnpm test
pnpm dump:snapshot -- --out tmp/snapshot.json   # 本地 live 集成测试依赖此文件
pnpm typecheck
pnpm build
```

## Required Before Live Data Sign-off

- `pnpm dump:snapshot` 能输出合法 `Snapshot`。
- `skippedCount` 和原因可解释。
- gzip 前 JSON 不超过约 500KB；超过则先回报并重估全量下发。
- `/[locale]`、`/[locale]/categories`、详情页、`/go/{recordId}` 都能用真实记录跑通。
- Blob 刷新失败不会覆盖上一份成功快照。
