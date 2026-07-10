# AI 活动雷达 操作手册

展示 Feishu Base 中已整理的 AI、编程、黑客马拉松、积分、资助和权益机会。中文品牌「AI 活动雷达」；英文对外名 AI Opportunity Radar。网站负责发现、筛选、排序、分类浏览和详情查看；报名、填报、参赛、数据采集和审核仍在官方页面或 Feishu/Base 工作流中完成。

## 必读入口

- 领域词汇：[`CONTEXT.md`](./CONTEXT.md)
- 当前实施状态：[`docs/implementation-tracker.md`](./docs/implementation-tracker.md)
- 架构决策：[`docs/adr/`](./docs/adr/)（数据链路以 ADR 0018 为准）
- 视觉参考：[`docs/design/README.md`](./docs/design/README.md)
- 部署：[`docs/cloudflare-deploy.md`](./docs/cloudflare-deploy.md)（生产，Cloudflare Workers）；[`docs/vercel-deploy.md`](./docs/vercel-deploy.md) 仅作回滚参考

## 工作规则

- 使用中文和用户交流。
- Shell 命令默认加 `rtk` 前缀。
- 单个代码文件不要超过 1000 行；超过前先拆最小必要边界。
- Git commit / PR 仅在用户明确要求时执行。
- 改架构、数据模型、路由边界或产品边界前，先读 `CONTEXT.md`、`docs/implementation-tracker.md` 和相关 ADR。
- Feishu、Next.js、Vercel Blob、SEO、AdSense 等外部能力以官方文档或真实接口返回为准。
- 不要安装带 compiled `AGENTS.md` 的 skill；会占用大量规则上下文。

## 当前状态

### 产品 / UI

- 发现首页（`/[locale]`）：精简布局 — hero、搜索、chip 筛选、Closing Soon、全量机会卡片网格；卡片可点击进入详情。
- 分类页（`/[locale]/categories`）：Smart Filter 带、可点击分类路径、匹配结果区。
- 详情页（`/[locale]/o/{recordId}/{slug}`）：已组件化（`DetailWidgets`），含样式化出站按钮。
- 归档页（`/[locale]/archive`）：展示已过期机会，按截止时间倒序；详情页对过期记录仍可访问。
- 导航：发现 / 分类 / 归档 + GitHub 外链 + 语言切换 + 数据更新时间；favicon 已配置。
- 静态页：About / Contact / Privacy / Terms 可用。

### 数据链路

- 快照随仓库提交：`src/data/snapshot.json`，运行时静态 import，不依赖 Feishu / Blob（ADR 0018）。
- 同步：GitHub Actions `.github/workflows/sync-snapshot.yml` 每天两次全量拉取 Feishu 并提交；push 触发 `.github/workflows/deploy.yml` 部署到 Cloudflare Workers 即完成数据更新。Secrets：`FEISHU_APP_ID` / `FEISHU_APP_SECRET` / `FEISHU_APP_TOKEN` / `CLOUDFLARE_API_TOKEN`。
- 本地手动同步：`pnpm sync:snapshot`（需 `.env` Feishu 凭证）；无凭证开发直接用仓库内快照。
- 归档合并：已过期记录即使从 Feishu 删除也保留在快照中；未过期却消失的记录视为人工删除、不保留。

### 阶段

- Phase 0/1（live 数据 + 核心产品链路）：已完成。
- Phase 2（SEO / 双语）：进行中。
- Phase 3（上线）：生产部署在 Cloudflare Workers（`airadar`，OpenNext 适配器，纯 SSG 无 ISR），正式域名 https://airadar.laifuyou.com ；待 Search Console、生产 analytics（可用 Cloudflare Web Analytics）。无需任何数据类环境变量；旧 Vercel 项目保留作回滚。

## Commands

```bash
pnpm install && pnpm dev
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm sync:snapshot   # 从 Feishu 全量拉取并写 src/data/snapshot.json（需 .env 凭证）
```

## Boundaries

**Always**

- Base 中文字段只允许留在 Feishu adapter / mapper / enum 归一化边界；UI 和页面使用 `ActivityOpportunity`。
- 对外跳转只能通过 `/go/{recordId}` 从快照解析官方报名入口，不接受任意 URL 参数。

**Ask first**

- Git commit / PR。
- 偏离 ADR 或已接受视觉方向（`docs/design/references/v2-*.png`）。

**Never**

- 引入 Hono、独立数据库、账号系统、收藏、提醒、后台管理、CMS、复杂搜索索引或独立 scheduled sync。
- 做站内活动提交和报名表单。
- 把用户内部维护状态直接暴露给公开 UI。

## Verification

改 lib 或数据链路后依次跑：`pnpm lint` → `pnpm test` → `pnpm typecheck` → `pnpm build`。

- `tests/live-snapshot.test.ts` 直接校验仓库内 `src/data/snapshot.json`，无需先拉取。
- `sync:snapshot` 输出合法 `Snapshot`；`skippedCount` 可解释；gzip 前 JSON 不超过约 500KB。
- `/[locale]`、`/[locale]/categories`、`/[locale]/archive`、详情页、`/go/{recordId}` 均能用真实记录跑通。
- 同步失败或记录数异常缩水（<上一份 50%）时不得提交，保留上一份快照。

## Source Of Truth

- Feishu Base 是活动机会数据源。
- `/Users/sunss/my-code/skills/plugins/jkk/skills/ai-vendor-campaign-radar/SKILL.md` 只作为字段契约和采集流程参考；实现前仍以 live Base 字段列表为准。
