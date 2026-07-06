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
| Phase 0 — Live data verification | Blocked by env | Feishu client、mapper、snapshot builder、`pnpm dump:snapshot` 已有；当前本地只配置了 app id/secret，还缺 Base app token/table id。 |
| Phase 1 — Core product link | Mostly done | 发现页、分类页、详情页、outbound、seed snapshot、Blob SWR skeleton、lib tests 已实现；真实数据验收后补显示控制细节。 |
| Phase 2 — SEO / bilingual | In progress | metadata、hreflang、robots、sitemap、JSON-LD gate、静态政策页已存在；copy 和详情页结构仍可根据真实内容优化。 |
| Phase 3 — Launch | Pending | 域名、Search Console、生产 analytics、Vercel Blob token、日志验证未做。 |

## Next Task Plan

1. 补齐环境变量：`FEISHU_APP_TOKEN`、`FEISHU_TABLE_ID`，部署侧再配 `BLOB_READ_WRITE_TOKEN`。
2. 跑 `pnpm dump:snapshot -- --out tmp/snapshot.json`，检查字段数量、记录数、跳过原因、JSON/gzip 体积。
3. 用真实 snapshot 对照 UI：标题长度、奖励摘要、截止状态、分类命中、详情字段、官方跳转。
4. 根据真实字段补 enum 映射和显示控制；只在 mapper/enum 层处理 Base 字段噪声。
5. 再做详情页视觉精修和 SEO copy，而不是先扩展后台或搜索服务。

## Verification Commands

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

## Required Before Live Data Sign-off

- `pnpm dump:snapshot` 能输出合法 `Snapshot`。
- `skippedCount` 和原因可解释。
- gzip 前 JSON 不超过约 500KB；超过则先回报并重估全量下发。
- `/[locale]`、`/[locale]/categories`、详情页、`/go/{recordId}` 都能用真实记录跑通。
- Blob 刷新失败不会覆盖上一份成功快照。
