# AI Opportunity Atlas 操作手册

展示 Feishu Base 中已整理的 AI、编程、黑客马拉松、积分、资助和权益机会。网站负责发现、筛选、排序、分类浏览和详情查看；报名、填报、参赛、数据采集和审核仍在官方页面或 Feishu/Base 工作流中完成。

## 必读入口

- 领域词汇：[`CONTEXT.md`](./CONTEXT.md)
- 当前实施状态：[`docs/implementation-tracker.md`](./docs/implementation-tracker.md)
- 总体方案：[`docs/plan-01.md`](./docs/plan-01.md)
- 开发规格：[`docs/plan-02-build-spec.md`](./docs/plan-02-build-spec.md)
- 架构决策：[`docs/adr/`](./docs/adr/)
- 视觉参考：[`docs/design/README.md`](./docs/design/README.md)

## 工作规则

- 使用中文和用户交流。
- Shell 命令默认加 `rtk` 前缀。
- 单个代码文件不要超过 1000 行；超过前先拆最小必要边界。
- Git commit / PR 仅在用户明确要求时执行。
- 改架构、数据模型、路由边界或产品边界前，先读 `CONTEXT.md`、`docs/implementation-tracker.md` 和相关 ADR。
- Feishu、Next.js、Vercel Blob、SEO、AdSense 等外部能力以官方文档或真实接口返回为准。
- 不要安装带 compiled `AGENTS.md` 的 skill；会占用大量规则上下文。

## 当前状态

- UI 主骨架已完成：`/[locale]` 首页、首屏 hero、Closing Soon、搜索/筛选条、Deadline Watch、机会卡片网格、`/[locale]/categories` 分类浏览页。
- 详情页、About、Contact、Privacy、Terms 已可用，但还不是高保真视觉重点；先保证真实数据链路和内容正确。
- 数据链路代码已有：Feishu client、字段校验、mapper、派生规则、seed snapshot、Blob snapshot、SWR 刷新语义、outbound route、lib 测试。
- 当前 `.env` 只有 `FEISHU_APP_ID` 和 `FEISHU_APP_SECRET`；真实数据验收还缺 `FEISHU_APP_TOKEN`、`FEISHU_TABLE_ID`，Blob 持久化还缺 `BLOB_READ_WRITE_TOKEN`。

## Source Of Truth

- Feishu Base 是活动机会数据源。
- `/Users/sunss/my-code/skills/plugins/jkk/skills/ai-vendor-campaign-radar/SKILL.md` 只作为字段契约和采集流程参考；实现前仍以 live Base 字段列表为准。
- Base 中文字段只允许留在 Feishu adapter / mapper / enum 归一化边界；UI 和页面使用 `ActivityOpportunity`。
- 对外跳转只能通过 `/go/{recordId}` 从快照解析官方报名入口，不接受任意 URL 参数。

## 非目标

- MVP 不引入 Hono、独立数据库、账号系统、收藏、提醒、后台管理、CMS、复杂搜索索引或独立 scheduled sync。
- 不做站内活动提交和报名表单。
- 不把用户内部维护状态直接暴露给公开 UI。
