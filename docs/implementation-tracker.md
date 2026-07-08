# Implementation Tracker

ADRs 记录架构决策；本文只记录当前执行状态和下一步任务。

## Locked Decisions

- 路由：`/` → `/zh`；`/{locale}` 是发现首页；`/{locale}/categories` 是分类浏览；`/{locale}/archive` 是过期归档；`/{locale}/o/{recordId}/{slug}` 是详情；`/go/{recordId}` 是 outbound。
- UI：已接受的高保真方向以 `docs/design/references/v2-*.png` 为准；自有 React 组件 + 全局 CSS，Tailwind v4 只作为可用基础。
- 数据：Feishu Base 是数据源；快照随仓库提交（`src/data/snapshot.json`，静态 import），由 GitHub Actions 每天两次同步并提交，push 即触发 Vercel 部署（ADR 0018）。
- 维护：Feishu/Base/hermes 负责采集、审核、维护；网站只读展示。
- 生产：https://airadar.laifuyou.com （Vercel，无需数据类环境变量）。

## Current UI Status

| Area | Status | Notes |
|---|---|---|
| 发现首页 | Done | hero、搜索、chip 筛选、Closing Soon、全量卡片网格；卡片链接详情。 |
| 分类页 | Done | Smart Filter 带、可点击分类路径、匹配结果区。 |
| 归档页 | Done | `/[locale]/archive` 展示已过期机会，按截止时间倒序。 |
| 详情页 | Done | `DetailWidgets` 组件化、出站按钮；metadata / JSON-LD 已接线；过期记录可访问。 |
| 导航 | Done | 发现 / 分类 / 归档 + GitHub 外链 + 语言切换 + 数据更新时间；favicon 已加。 |
| 静态页 | Functional | About / Contact / Privacy / Terms 可访问。 |

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| Phase 0/1 — live 数据 + 核心链路 | Done | Feishu → mapper → snapshot 全链路验收通过。 |
| Phase 2 — SEO / 双语 | In progress | metadata、hreflang、robots、sitemap、JSON-LD、静态政策页已就绪；copy 可继续微调。 |
| Phase 3 — 上线 | In progress | 生产已部署，域名 airadar.laifuyou.com；待 Search Console、生产 analytics。 |

## Next Task Plan

1. 手动触发一次 `sync-snapshot` workflow 验收（secrets 已配置后）。
2. 在 Vercel 移除旧的 `FEISHU_*` / `BLOB_READ_WRITE_TOKEN` / `SNAPSHOT_TTL_HOURS` 环境变量，删除 Blob Store。
3. Search Console、生产 analytics 等 Phase 3 剩余上线项。
4. 可选：首页筛选状态同步到 URL query。

## 2026-07-07 数据链路迁移（ADR 0018）

- 快照入仓：`src/data/snapshot.json`（live 63 条），运行时静态 import；删除 Blob store / 本地文件 / seed 回退链，移除 `@vercel/blob`。
- 同步：`scripts/sync-snapshot.ts`（`pnpm sync:snapshot`）+ `.github/workflows/sync-snapshot.yml`（北京时间约 10:30/20:30，跟在 hermes 10:00/20:00 采集后 + 手动触发）；提交前跑 `pnpm test` 作校验闸门；过期记录从 Feishu 删除后仍保留在快照中（归档合并）。
- 归档页：`/[locale]/archive` 展示已过期机会（当前 12 条），导航加「归档」，sitemap 已收录。
- 域名与文档：siteUrl 默认 https://airadar.laifuyou.com ；删除旧 plan 文档（plan-01 / plan-02）与已废弃 ADR（0005 / 0016），重写部署说明。
- 验收：lint / test / typecheck / build 全过；本地 prod server 实测 `/zh`、`/zh/archive`、过期详情页 200，`/go/{id}` 302 到官方 URL，伪造 ID 404；`pnpm sync:snapshot` live 拉取成功（fields 22 / records 63 / skipped 0 / gzip ~17KB）。

## Verification Commands

```bash
pnpm lint
pnpm test          # live-snapshot 测试直接校验 src/data/snapshot.json
pnpm typecheck
pnpm build
pnpm sync:snapshot # 需 .env Feishu 凭证；写 src/data/snapshot.json
```

## Required Before Live Data Sign-off

- `pnpm sync:snapshot` 能输出合法 `Snapshot`。
- `skippedCount` 和原因可解释。
- gzip 前 JSON 不超过约 500KB；超过则先回报并重估全量下发。
- `/[locale]`、`/[locale]/categories`、`/[locale]/archive`、详情页、`/go/{recordId}` 都能用真实记录跑通。
- 同步失败或记录数异常缩水时不提交，保留上一份成功快照。
