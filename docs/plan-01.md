
本项目做一个面向 AI、编程、黑客马拉松等活动机会的网站，帮助用户发现、筛选、判断并查看活动详情。网站只负责展示和决策辅助；报名、填报和参赛流程跳转到官方活动页面完成。

> 本文档定战略与边界；可直接开工的实施规格见 [plan-02-build-spec.md](./plan-02-build-spec.md)。

## Agent Rules

- 使用中文和用户交流。
- 先读 [CONTEXT.md](../CONTEXT.md) 和 [docs/adr](./adr) 再改架构、数据模型或产品边界。
- Shell 命令默认加 `rtk` 前缀。
- Feishu、Next.js、SEO、AdSense、部署平台等外部能力要查官方文档或真实接口约束，不凭印象设计。
- 保持最小实现：没有明确需求或 ADR 变更前，不引入 Hono、数据库、账号系统、管理后台、CMS、定时同步服务或复杂搜索索引。

## Source Of Truth

- Feishu Base 是活动机会数据的 source of truth。
- 现有 radar skill 和 Feishu Base 流程负责采集、整理、审核和写入数据。
- 本网站只读展示 Feishu Base 的已处理数据，支持活动发现、判断和详情查看。
- 本网站不负责活动采集、审核、写入、后台管理、报名、填报或参赛流程。
- 参考 skill：`/Users/sunss/my-code/skills/plugins/jkk/skills/ai-vendor-campaign-radar/SKILL.md`，其 `references/bitable-api-patterns.md` 记录了已验证的 22 字段契约（table_id `tblYhMRh3fJ0FDfW`）。但实现前要重新验证 live Base 字段和接口返回。

## Confirmed Architecture

- MVP 使用单个 Next.js 应用（App Router），包含页面和 backend-for-frontend route handlers。
- 不引入 Hono；除非未来多个客户端需要版本化共享 API、小程序需要独立后端，或部署约束证明独立服务更便宜。
- 部署优先考虑 Vercel；Cloudflare 可用于域名、DNS、CDN。不要因为有自有服务器就默认自托管。
- 使用 Vercel Blob 保存最新成功的派生 JSON 快照，默认约 6 小时新鲜期。
- 快照刷新遵循 stale-while-revalidate（ADR 0016）：读取顺序为实例内存 → Blob → Feishu；有旧快照时立即返回旧数据并在响应后用 `after()` 后台刷新，只有快照完全缺失时才同步阻塞刷新。刷新失败或返回记录数异常偏少时，不覆盖上一份成功快照，继续服务旧数据并在 UI 标注数据更新时间。
- 不做独立 scheduled sync；除非流量、数据量或新鲜度需求证明 lazy refresh 不够。
- 不用本地 serverless 内存作为持久缓存；内存和 CDN 只能做热缓存。

## Rendering Strategy

- 列表页和详情页都由服务端渲染（ADR 0015），初始 HTML 含真实内容和所有未过期详情页的链接；这是详情页被搜索引擎发现的主要途径（MVP 无动态 sitemap）。
- 列表页把完整快照数据随服务端渲染一次性带到浏览器（不做第二次客户端 fetch），之后搜索、筛选、排序、标签、截止分桶全部在浏览器内存中完成。
- 详情页只序列化自己那条记录到客户端，不带全量快照（最小化 RSC 边界序列化）。
- 页面缓存：列表页和详情页用 ISR 或 `s-maxage` + `stale-while-revalidate` 响应头做短周期（分钟级）页面缓存；数据新鲜度由快照层的 6 小时窗口控制，页面缓存只是热缓存。
- 截止状态（3 天内、7 天内、长期、已过期）按活动结束时间派生。服务端渲染时以快照生成时刻为基准，客户端 hydration 后可用本地时间修正；跨时区显示统一按 `Asia/Shanghai` 计算截止日，避免 hydration 抖动。

## Feishu Read Path

- 自建应用用 `app_id` / `app_secret` 获取 `tenant_access_token`，token 只在服务端使用。
- 除 app 凭证外，还需要 Base 的 `app_token` 和 `table_id` 作为环境变量（`FEISHU_APP_TOKEN`、`FEISHU_TABLE_ID`）；本仓库当前只有 app 凭证，开工前必须补齐。
- 读取记录使用 Feishu Base records search/list 类接口分页拉取；官方单次最多 500 行，必须处理 `has_more` / `page_token`。
- 字段列表接口也要读取并校验必要字段；当前已知表约 22 个字段，但 live Base 永远优先。
- 如果 Base 开启高级权限，调用身份必须有足够文档权限；否则可能成功返回空数据。ADR 0016 的"记录数异常偏少不覆盖旧快照"就是针对这种静默失败的防线。
- Base 中文字段只在 Feishu adapter 边界出现，应用内部映射成稳定的 `ActivityOpportunity` 模型。

## Data Quality

- 每条记录在 adapter 边界用 Zod schema 校验，fail-soft：无效记录跳过并记录 `record_id` 和原因，绝不因单条坏数据导致整个快照失败（ADR 0017）。
- 枚举归一化用显式代码内映射表：`推荐指数` 星级字符串 → 数字；`难度评级` 历史重复选项 → 五档规范值；各 select 中文选项 → 稳定的内部 enum key（UI 按 locale 翻译）。未知选项降级为原文展示，不隐藏记录。
- 无标题或无有效报名 URL 的记录从快照排除。
- 快照 JSON 携带 `schemaVersion`、`generatedAt`、`recordCount`。
- mapper 必须有 fixture 测试：日期、单选、多选、星级解析、畸形 URL、空字段、过期判断。

## Product Scope

- 目标用户是所有对 AI 活动机会感兴趣的人，不限开发者。
- 核心场景是机会发现：快速判断某个机会是否值得参加。
- 列表页展示：活动名称、厂商、活动类型、推荐指数、奖励摘要、截止状态、地区、难度评级、官方确认、报名入口。
- 详情页展示：奖励详情、参与方式、获奖条件、时间节点备注、开始/截止时间、活动形式、预计投入、来源渠道、公开状态、官方确认、报名入口。
- 详情页 URL 使用 Feishu `record_id` 作为稳定主键，slug 只用于可读和 SEO：`/{locale}/o/{record_id}/{slug}`，slug 漂移时 canonical 指向当前 slug。
- 报名按钮走薄 outbound route（`/go/{record_id}`）：只接受 `record_id`，记录点击事件，从快照解析官方入口并重定向；不要接受任意 URL，避免 open redirect。该路由必须是动态路由（不可缓存），否则点击统计失效。
- 记录从 Base 删除后详情页返回 404；MVP 不做 tombstone。

## Discovery Rules

- 交互式搜索、筛选、排序、标签、分类、推荐和截止状态在浏览器侧对已下发的快照数据完成（初始渲染在服务端，见 Rendering Strategy）。
- 中文搜索用子串匹配即可，当前数据量不需要分词或索引。
- 公开状态只展示 `进行中`、`即将截止`、`长期`、`已过期`；不要直接暴露 `已报名`、`已跳过` 等内部管理状态。
- 过期活动默认从发现列表隐藏，但可通过筛选和直接详情 URL 查看。
- 推荐和精选只是基于推荐指数、截止时间、奖励价值、难度、官方确认、类型等字段的确定性排序视图，不是人工运营列表。
- 标签从活动类型、奖励类型、地区、厂商等字段派生；MVP 包含一个顶层分类浏览页，但不做每个分类、标签、厂商或奖励类型的独立 SEO 页面。

## Explicit Non-Goals For MVP

- 不做账号、登录、用户画像、收藏、稍后看、截止提醒、行为个性化或 AI 推荐。
- 不做提交活动表单；如果用户想推荐活动，先通过 Contact 处理。
- 不做管理后台；Feishu Base 就是管理界面。
- 不做 CMS 或单独详情数据源；列表和详情读同一份快照。
- 不做服务端搜索或外部索引，除非快照大小、查询延迟或 SEO 需求证明前端搜索不够。

## I18n, SEO, GEO, Ads

- MVP 支持中英双语路由：`/zh` 和 `/en`，`/` 默认到 `/zh`。i18n 用 next-intl（或等价的 App Router 原生方案），不自研。
- UI 文案、筛选项、状态、枚举、日期、截止状态和 SEO metadata 做双语；枚举翻译依赖 Data Quality 中的 enum key 映射，新增 Base 选项未配翻译时英文界面回退展示中文原文。
- 活动长文本（奖励详情、参与方式、获奖条件等）保留 Feishu Base 原文，不自动翻译；英文详情页对中文长文本标注语言（`lang="zh"`），保持诚实而不是机翻。
- 详情页和语言路由应可索引，包含 localized metadata、hreflang、canonical、robots、Open Graph。
- Event JSON-LD 只用于确实具备活动语义的记录；credits、内测权益、福利类机会不要硬套 Event。
- MVP 不生成动态机会详情全量 sitemap；详情页靠服务端渲染的列表页内链发现（ADR 0015），后续有索引证据再加运行时 sitemap。
- GEO 指 generative search visibility：做好有用、原创、结构清晰的页面，不做 LLM-only 文件或操纵性 AI 搜索策略。
- MVP 不接 AdSense 代码；先准备双语 About、Contact、Privacy、Terms 和稳定导航。
- 使用轻量、隐私友好的 analytics，记录页面访问、详情访问、筛选使用和报名入口点击；不要做个人追踪或重营销脚本。

## Tech Stack

- Next.js（App Router）+ TypeScript strict + Tailwind CSS v4 基础能力；当前已接受 UI 用自有全局 CSS 复刻。
- Zod 做 adapter 边界校验；next-intl 做 i18n；Vercel Blob 做快照存储。
- 测试用 Vitest，最小范围：mapper fixture、截止分桶、outbound 解析。不追求覆盖率指标。
- 包管理 pnpm。

## Phased Roadmap

按顺序交付，每个阶段有明确验证点，不跨阶段并行：

1. **Phase 0 — 数据链路验证**：用真实凭证跑通 tenant_access_token → 字段列表 → 记录分页拉取，把一份真实响应存为 fixture；确认记录总量和快照 JSON 体积（决定全量下发是否成立）；确定枚举归一化映射表。验证点：脚本一键 dump 出合法的 `ActivityOpportunity[]` JSON。
2. **Phase 1 — 核心链路**：快照管道（Blob + SWR 语义）、首页、分类浏览页、详情页、outbound 跳转，双语路由骨架同步搭好（后补文案）。验证点：本地和 Vercel preview 上完整走通"发现 → 分类 → 详情 → 跳转官方页"。
3. **Phase 2 — 双语与 SEO**：补齐双语文案、metadata、hreflang、canonical、OG、合格记录的 Event JSON-LD、About/Contact/Privacy/Terms。验证点：Rich Results 测试通过，两种语言路由可被抓取。
4. **Phase 3 — 上线**：域名、DNS、analytics 接入、Search Console 提交、快照刷新失败的日志告警。验证点：真实域名可访问，analytics 收到事件。
5. **之后（有证据再做）**：运行时 sitemap、每个标签/厂商/奖励类型的独立页面、服务端搜索、AdSense、小程序、账号体系。

## Implementation Checkpoints

- 开始搭建前，先用用户提供的 `appId` / `appSecret`、`app_token`、`table_id` 跑通 Feishu 字段列表和记录分页读取（Phase 0）。
- 第一次实现 `ActivityOpportunity` 时，要保留一个小的映射测试或 fixture，覆盖日期、单选、多选、URL、空字段和过期判断。
- 对外部链接跳转必须测试：只能通过 `record_id` 解析，不允许任意 URL 参数跳转。
- 快照体积超过约 500KB（gzip 前）时，重新评估"全量下发到浏览器"的决定，再考虑分页 API 或服务端筛选。
