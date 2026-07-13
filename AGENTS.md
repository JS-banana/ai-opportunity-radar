# AI 活动雷达 操作手册

展示 Feishu Base 中已整理的 AI、编程、黑客马拉松、积分、资助和权益机会。中文品牌「AI 活动雷达」；英文对外名 AI Opportunity Radar。网站负责发现、筛选、排序、分类浏览和详情查看；报名、填报、参赛、数据采集和审核仍在官方页面或 Feishu/Base 工作流中完成。

生产站点：https://airadar.laifuyou.com （Cloudflare Workers，已上线）。

## 必读入口

- 领域词汇：[`CONTEXT.md`](./CONTEXT.md)
- 维护者本机文档（**不入仓**）：`docs/`（ADR、implementation-tracker、部署笔记、视觉参考）。改架构或数据模型前，若本地有该目录则先读，再对照本手册与代码。

## 工作规则

- 使用中文和用户交流。
- Shell 命令默认加 `rtk` 前缀。
- 单个代码文件不要超过 1000 行；超过前先拆最小必要边界。
- Git commit / PR 仅在用户明确要求时执行。
- 改架构、数据模型、路由边界或产品边界前，先读 `CONTEXT.md`，并在本地查阅 `docs/`（若存在）。
- Feishu、Next.js、Cloudflare、SEO、AdSense 等外部能力以官方文档或真实接口返回为准。
- 不要安装带 compiled `AGENTS.md` 的 skill；会占用大量规则上下文。

## 当前状态（已上线）

### 产品 / UI

- 发现首页（`/[locale]`）：hero、搜索、chip 筛选、Closing Soon、全量机会卡片网格；卡片进入详情。
- 分类页（`/[locale]/categories`）：Smart Filter 带、可点击分类路径、匹配结果区。
- 详情页（`/[locale]/o/{recordId}/{slug}`）：`DetailWidgets`；报名入口直链官方 URL，新标签打开。
- 归档页（`/[locale]/archive`）：已过期机会，按截止时间倒序；过期详情仍可访问。
- 导航：发现 / 分类 / 归档 + GitHub 外链 + 语言切换 + 数据更新时间。
- 静态页：About / Contact / Privacy / Terms。

### 数据链路

- 快照随仓库提交：`src/data/snapshot.json`，运行时静态 import，不依赖 Feishu / Blob。
- 同步：GitHub Actions `.github/workflows/sync-snapshot.yml` 每天两次全量拉取 Feishu 并提交；push 触发 `.github/workflows/deploy.yml` 部署到 Cloudflare Workers。Secrets：`FEISHU_APP_ID` / `FEISHU_APP_SECRET` / `FEISHU_APP_TOKEN` / `CLOUDFLARE_API_TOKEN`。
- 本地手动同步：`pnpm sync:snapshot`（需 `.env` Feishu 凭证）；无凭证开发直接用仓库内快照。
- 归档合并：已过期记录即使从 Feishu 删除也保留在快照中；未过期却消失的记录视为人工删除、不保留。

### 部署

- 生产：Cloudflare Workers（`airadar`，OpenNext，纯 SSG）；正式域名 https://airadar.laifuyou.com 。
- 运行时无需数据类环境变量；可选后续接入 Search Console / Cloudflare Web Analytics。

## Commands

```bash
pnpm install && pnpm dev
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm sync:snapshot   # 从 Feishu 全量拉取并写 src/data/snapshot.json（需 .env 凭证）
```

## Boundaries

**Always**

- Base 中文字段只允许留在 Feishu adapter / mapper / enum 归一化边界；UI 和页面使用 `ActivityOpportunity`。
- 报名入口使用快照内 `registrationUrl` 直链，并在新标签打开；禁止开放重定向端点（不接受任意 URL 参数跳转）。

**Ask first**

- Git commit / PR。
- 偏离已接受视觉方向（本地 `docs/design/references` 若存在，或现有 `src/styles/atlas*.css` / discovery 组件）。

**Never**

- 引入 Hono、独立数据库、账号系统、收藏、提醒、后台管理、CMS、复杂搜索索引或独立 scheduled sync。
- 做站内活动提交和报名表单。
- 把用户内部维护状态直接暴露给公开 UI。

## Verification

改 lib 或数据链路后依次跑：`pnpm lint` → `pnpm test` → `pnpm typecheck` → `pnpm build`。

- `tests/live-snapshot.test.ts` 直接校验仓库内 `src/data/snapshot.json`，无需先拉取。
- `sync:snapshot` 输出合法 `Snapshot`；`skippedCount` 可解释；gzip 前 JSON 不超过约 500KB。
- `/[locale]`、`/[locale]/categories`、`/[locale]/archive`、详情页均可跑通；报名链为官方 URL 新标签打开。
- 同步失败或记录数异常缩水（<上一份 50%）时不得提交，保留上一份快照。

## Source Of Truth

- Feishu Base 是活动机会数据源；仓内 `src/data/snapshot.json` 是网站唯一运行时数据。
- 字段契约与采集流程以 live Base 字段列表为准。
