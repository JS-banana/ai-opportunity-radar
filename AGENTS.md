# AI 活动雷达 操作手册

展示 Feishu Base 中已整理的 AI、编程、黑客马拉松、积分、资助和权益机会。中文品牌「AI 活动雷达」；英文对外名 AI Opportunity Radar。网站负责发现、筛选、排序、分类浏览和详情查看；报名、填报、参赛、数据采集和审核仍在官方页面或 Feishu/Base 工作流中完成。

## 必读入口

- 领域词汇：[`CONTEXT.md`](./CONTEXT.md)
- 当前实施状态：[`docs/implementation-tracker.md`](./docs/implementation-tracker.md)
- 总体方案：[`docs/plan-01.md`](./docs/plan-01.md)
- 开发规格：[`docs/plan-02-build-spec.md`](./docs/plan-02-build-spec.md)
- 架构决策：[`docs/adr/`](./docs/adr/)
- 视觉参考：[`docs/design/README.md`](./docs/design/README.md)
- Vercel 部署：[`docs/vercel-deploy.md`](./docs/vercel-deploy.md)

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
- 导航：发现 / 分类 + GitHub 外链 + 语言切换 + 数据更新时间；favicon 已配置。
- 静态页：About / Contact / Privacy / Terms 可用。

### 数据链路

- Feishu → mapper → snapshot 已跑通：61 条 live 记录，`pnpm dump:snapshot` 成功。
- 读取优先级：内存 → Blob → 本地文件（默认 `tmp/snapshot.json`）→ `seedSnapshot`。
- 无 Feishu 凭证的本地开发：先 `pnpm dump:snapshot`，或依赖 seed；集成测试依赖 `tmp/snapshot.json`。
- Blob 持久化（`BLOB_READ_WRITE_TOKEN`）与生产部署：未配置，暂缓。

### 阶段

- Phase 0/1（live 数据 + 核心产品链路）：已完成。
- Phase 2（SEO / 双语）：进行中。
- Phase 3（上线）：待域名、Search Console、Blob、生产 analytics。

## Commands

```bash
pnpm install && pnpm dev
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm dump:snapshot -- --out tmp/snapshot.json   # live 拉取；live-snapshot 测试依赖此文件
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

- `tests/live-snapshot.test.ts` 需先执行 `pnpm dump:snapshot`。
- `dump:snapshot` 输出合法 `Snapshot`；`skippedCount` 可解释；gzip 前 JSON 不超过约 500KB。
- `/[locale]`、`/[locale]/categories`、详情页、`/go/{recordId}` 均能用真实记录跑通。
- Blob 刷新失败不得覆盖上一份成功快照。

## Source Of Truth

- Feishu Base 是活动机会数据源。
- `/Users/sunss/my-code/skills/plugins/jkk/skills/ai-vendor-campaign-radar/SKILL.md` 只作为字段契约和采集流程参考；实现前仍以 live Base 字段列表为准。
