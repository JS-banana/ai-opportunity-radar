# Implementation Tracker

ADRs 记录架构决策；本文只记录当前执行状态和下一步任务。

## Locked Decisions

- 路由：`/` → `/zh`；`/{locale}` 是发现首页；`/{locale}/categories` 是分类浏览；`/{locale}/o/{recordId}/{slug}` 是详情；`/go/{recordId}` 是 outbound。
- UI：已接受的高保真方向以 `docs/design/references/v2-*.png` 为准；当前实现为自有 React 组件 + 全局 CSS，Tailwind v4 只作为可用基础，不再回退到临时样式。
- 数据：Feishu Base + 派生 snapshot 是 UI 的真实数据源。读取链：内存 → Blob → 本地文件（`tmp/snapshot.json`）→ `seedSnapshot`。
- 维护：Feishu/Base/skill 负责采集、审核、维护；网站只读展示。

## Current UI Status

| Area | Status | Notes |
|---|---|---|
| 发现首页 | Done | 精简布局：hero、搜索、chip 筛选、Closing Soon、全量卡片网格；卡片链接详情。 |
| 分类页 | Done | Smart Filter 带、可点击分类路径、匹配结果区；不生成每个 tag 的独立页。 |
| 详情页 | Done | 组件化 `DetailWidgets`、样式化出站按钮；metadata / JSON-LD 已接线。 |
| 导航 | Done | 发现 / 分类 + GitHub 外链 + 语言切换 + stale 时间展示；favicon 已加。 |
| 静态页 | Functional | About / Contact / Privacy / Terms 可访问，用于 SEO/AdSense 前置。 |
| 响应式 | Done for MVP | desktop 与 mobile 已跑过截图检查；后续跟真实数据长度再调。 |

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| Phase 0 — Live data verification | Done | `.env` 四元组齐全；`dump:snapshot` 成功：`fields: 22`、`records: 61`、`skipped: 0`、gzip 前 JSON 73,949 bytes（&lt; 500KB）。 |
| Phase 1 — Core product link | Done | 发现页筛选与网格、分类页搜索与真实计数、stale 展示、详情/outbound/SWR/lib tests；live enum 已对账；`tests/live-snapshot.test.ts` 用 61 条真实快照验收（50 active / 11 expired）。 |
| Phase 2 — SEO / bilingual | In progress | metadata、hreflang、robots、sitemap、JSON-LD gate、静态政策页已存在；copy 和详情结构仍可按真实内容微调。 |
| Phase 3 — Launch | In progress | 生产已部署至 https://ai-hackathons.vercel.app ；Blob + Feishu 四元组 + `SNAPSHOT_TTL_HOURS=24` 已配置；自定义域名、Search Console、生产 analytics 待做。 |

## Next Task Plan

1. 自定义域名、Search Console、生产 analytics 等 Phase 3 剩余上线项。
2. 可选：首页筛选状态同步到 URL query（build spec §8，非 MVP 阻塞）。
3. 可选：24h+ 后复访，确认 stale 路径下 SWR 后台刷新成功。

## 2026-07-06 验收记录

### 数据与链路

| 检查项 | 结果 |
|---|---|
| `pnpm lint` / `test` / `typecheck` / `build` | 全部通过（含 `live-snapshot` 集成测试，需先 `dump:snapshot`） |
| `pnpm dump:snapshot` | **成功** — `fields: 22`、`records: 61`、`skipped: 0`、JSON 73,949 bytes / gzip ~16.7KB |
| mapper-enum-reconcile | **完成** — live Base 枚举全覆盖 |
| e2e-verification | **完成** — `/zh` SEO 隐藏链接 50 条；`/zh/categories`、详情、`/go/{id}` 302 到官方 URL；metadata/JSON-LD 正常 |
| prod-blob-verify | **跳过** — 用户要求暂缓 Blob/Vercel 部署 |

### 生产部署（2026-07-06 晚间）

| 检查项 | 结果 |
|---|---|
| Vercel 项目 | `jsbananas-projects/ai-hackathons`，别名 https://ai-hackathons.vercel.app |
| Blob Store | `ai-hackathons-snapshots`（`store_zq6ZZqmHrJvljOyR`），路径 `snapshots/latest.json` |
| 环境变量 | Production：`FEISHU_*` 四元组、`BLOB_READ_WRITE_TOKEN`、`SNAPSHOT_TTL_HOURS=24` |
| 预置快照 | 本地 `tmp/snapshot.json` 上传至 Blob（`recordCount: 62`、`skipped: 0`） |
| `/zh` 首页 | 真实数据（非 6 条 seed）；导航显示「数据更新于 …」 |
| `/zh/categories`、详情页 | 200，内容正常 |
| `/go/{recordId}` | 302 到官方 URL；伪造 ID → 404 |
| `/` | 重定向至 `/zh` |

### UI 精修（同日后续提交）

| 检查项 | 结果 |
|---|---|
| 首页精简 | hero + chip 筛选 + Closing Soon + 全量网格；移除独立 sticky 筛选条 |
| 机会卡片 | 整卡可点进详情 |
| 分类页 | Smart Filter 带 + 可点击分类路径 |
| 详情页 | `DetailWidgets` 组件化、出站按钮样式 |
| 导航与品牌 | 主导航精简、GitHub 外链、favicon；中文站名「AI 活动雷达」 |

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
