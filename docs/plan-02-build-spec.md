# Build Spec — AI 活动机会网站（交付给开发 agent）

本文档是可直接开工的实施规格。战略与边界见 [plan-01.md](./plan-01.md)，架构决策见 [docs/adr](./adr)。两者冲突时以 ADR 为准；本文档只细化，不推翻。

**给开发 agent 的硬规则**：

- 使用中文和用户交流。
- 改架构、数据模型或产品边界前，先读 CONTEXT.md 和全部 ADR；要改决策就先提议新 ADR，不要静默偏离。
- 外部能力（Feishu API、Next.js、Vercel Blob）以官方文档和真实接口返回为准，不凭印象写。
- 按 Phase 顺序交付，每个 Phase 通过验收标准后再进入下一个。
- 视觉设计已通过 app web builder 完成复刻并被接受。后续实现需保持该视觉方向，不再回退到临时结构样式；如要偏离，应先更新实施跟踪或 ADR。

## 1. 技术栈

| 项 | 选择 | 说明 |
|---|---|---|
| 框架 | Next.js 最新稳定版（App Router）| 开工时用 `pnpm create next-app` 的当前稳定版并锁定 |
| 语言 | TypeScript，`strict: true` | |
| 样式 | Tailwind CSS v4 基础能力 + 自有全局 CSS | 当前复刻在 `src/styles/atlas*.css`；不初始化 shadcn/ui，除非出现具体可访问组件需求 |
| 校验 | Zod | 只用在 Feishu adapter 边界 |
| i18n | next-intl（`[locale]` 动态段方案）| `/zh`、`/en` |
| 快照存储 | Vercel Blob（`@vercel/blob`）| |
| 测试 | Vitest | 只测 lib 层，不测 UI |
| 包管理 | pnpm | |
| 部署 | Vercel | |

## 2. 环境变量契约

```
FEISHU_APP_ID          # 自建应用 ID（已有）
FEISHU_APP_SECRET      # 自建应用密钥（已有）
FEISHU_APP_TOKEN       # 多维表格 Base 的 app_token（待用户提供）
FEISHU_TABLE_ID        # 默认 tblYhMRh3fJ0FDfW
BLOB_READ_WRITE_TOKEN  # Vercel Blob（Vercel 项目自动注入，本地开发需手动配置）
SNAPSHOT_TTL_HOURS     # 可选，默认 6
```

所有变量只在服务端读取，禁止出现在任何 `NEXT_PUBLIC_` 变量或客户端代码中。页面可在 Feishu env 缺失时使用 seed fallback；`dump:snapshot`、同步刷新和生产验收必须通过 `src/lib/env.ts` 的 Zod 校验。

## 3. 目录结构

```
src/
  app/
    [locale]/
      layout.tsx            # locale 校验、next-intl provider、导航、footer
      page.tsx              # 发现列表页（RSC）
      categories/page.tsx   # 分类浏览页（RSC + 客户端交互）
      o/[recordId]/[[...slug]]/page.tsx   # 详情页（RSC）
      about/page.tsx  contact/page.tsx  privacy/page.tsx  terms/page.tsx
    go/[recordId]/route.ts  # outbound 跳转（动态，不缓存）
    robots.ts
    sitemap.ts              # 只含静态页面与列表页，不含详情页（ADR 0012）
  components/
    AtlasLanding.tsx        # 当前首页和分类页复刻实现；超过 1000 行前再拆
    discovery/              # 列表交互客户端组件（筛选、搜索、排序）
    opportunity/            # 卡片、详情区块（尽量保持 RSC）
  lib/
    env.ts                  # 环境变量校验
    feishu/
      client.ts             # tenant_access_token 获取与缓存、分页拉取
      types.ts              # Feishu 原始响应类型
    opportunity/
      model.ts              # ActivityOpportunity 类型 + Zod schema
      mapper.ts             # Feishu record -> ActivityOpportunity（含枚举归一化）
      derive.ts             # 截止分桶、公开状态、排序、slug
      enums.ts              # 枚举 key、中文源值映射、双语 label
    snapshot/
      store.ts              # Blob 读写
      refresh.ts            # 拉取→校验→写入，含记录数保护
      get.ts                # getSnapshot()：内存→Blob→SWR 后台刷新
  messages/
    zh.json  en.json        # UI 文案
  i18n/                     # next-intl 配置
tests/
  fixtures/feishu-records.json   # Phase 0 dump 的真实响应（脱敏后）
  mapper.test.ts  derive.test.ts  outbound.test.ts
```

模块依赖方向：`app → components → lib/opportunity → lib/feishu`。`lib/feishu` 不得 import 任何上层；Base 中文字段名只允许出现在 `lib/feishu` 和 `lib/opportunity/mapper.ts`、`enums.ts` 中。

## 4. 数据模型

### 4.1 ActivityOpportunity

```typescript
interface ActivityOpportunity {
  id: string;                    // Feishu record_id，稳定主键
  title: string;                 // 活动名称（必填，缺失则整条剔除）
  vendor: string;                // 厂商，源值原样保留
  type: OpportunityType;         // 归一化枚举
  score: 1 | 2 | 3 | 4 | 5;      // 由 推荐指数 星级字符串解析；缺失默认 3
  difficulty: Difficulty | null;         // 五档归一化
  difficultyNote: string | null;         // 难度说明
  rewardSummary: string | null;          // 奖励详情首行/前 80 字符，列表页用
  rewardDetail: string | null;           // 奖励详情全文
  rewardTypes: RewardType[];             // 奖励类型（多选）
  format: string | null;                 // 活动形式
  participation: string | null;          // 参与方式
  winningCriteria: string | null;        // 获奖条件
  timelineNotes: string | null;          // 时间节点备注
  startAt: string | null;                // ISO 8601，源为 ms 时间戳
  endAt: string | null;                  // ISO 8601；null 视为长期
  region: Region;                        // 地区
  officialStatus: OfficialStatus;        // 官方确认
  registrationUrl: string;               // 报名入口（必填有效 URL，否则整条剔除）
  sourceChannel: string | null;          // 来源渠道
  estimatedEffort: string | null;        // 预计投入，源值原样保留
  suggestion: Suggestion | null;         // 建议
  discoveredAt: string | null;           // 发现日期
  slug: string | null;                   // 派生，见 5.4
}
```

### 4.2 枚举与归一化

内部 enum key 用稳定英文标识；`enums.ts` 维护三列映射：**Base 中文源值 → enum key → { zh, en } label**。未知源值统一落 `other`，UI 回退展示源值原文（ADR 0017）。

| 枚举 | key 集合（源值见 radar skill 字段契约） |
|---|---|
| OpportunityType | `hackathon` `dev-challenge` `dev-incentive` `ai-competition` `beta-access` `benefit` `content-creation` `other` |
| Difficulty | `1`–`5`（`⭐ 轻松领取` → 1 … `⭐⭐⭐⭐⭐ 专业挑战` → 5；历史重复选项按星数归并） |
| RewardType | `cash` `api-credits` `membership` `physical` `certificate` `other` |
| Region | `global` `china` `north-america` `apac` `europe` `japan` `other` |
| OfficialStatus | `confirmed`（✅）`suspected`（⚠️）`unofficial`（❌），缺失 → `suspected` |
| Suggestion | `act-now` `worth-doing` `watch` `skip` |

`推荐指数` 解析：数星号字符数量；非星级字符串或缺失 → 3 并记日志。

### 4.3 剔除与保留规则（ADR 0017）

- 剔除整条：无 `活动名称`；`报名入口` 缺失或不是合法 `http(s)` URL；内部 `状态` 为 `已跳过`（Base 主人明确判定不值得，公开站不展示）。
- 其余字段一律 fail-soft：解析失败置 null / other 并记录 `record_id` + 原因。
- 内部 `状态` 其他值（`新发现`/`已报名`/`进行中`/`已完成`/`已过期`）不影响展示，公开状态一律按时间派生（见 5.2）。

### 4.4 快照格式

```typescript
interface Snapshot {
  schemaVersion: 1;
  generatedAt: string;        // ISO 8601
  recordCount: number;
  skippedCount: number;       // 被剔除的记录数
  opportunities: ActivityOpportunity[];
}
```

Blob 路径 `snapshots/latest.json`。刷新成功但 `recordCount` 少于上一份的 50% 且上一份 ≥ 10 条时，视为疑似权限静默失败：不覆盖，记错误日志（ADR 0016）。

## 5. 派生规则（`derive.ts`，全部纯函数 + 单测）

所有时间计算以 `Asia/Shanghai` 为准；"现在"由调用方注入（便于测试与 SSR 一致性）。

### 5.1 截止分桶 DeadlineBucket

| bucket | 条件（按优先级） |
|---|---|
| `expired` | `endAt` 存在且 < now |
| `ending-3d` | endAt − now ≤ 3 天 |
| `ending-7d` | endAt − now ≤ 7 天 |
| `ongoing` | endAt 存在且 > 7 天 |
| `long-term` | endAt 为 null |

### 5.2 公开状态 PublicStatus

`expired` → `已过期`；`ending-3d`/`ending-7d` → `即将截止`；`ongoing` → `进行中`；`long-term` → `长期`。不暴露任何内部管理状态（ADR 0007）。

### 5.3 默认排序与"精选"

- 默认排序 key（依次比较）：非过期在前 → `score` 降序 → 截止紧迫度（`ending-3d` > `ending-7d` > `ongoing` > `long-term`）→ `discoveredAt` 降序。
- 精选区 = `score ≥ 4` 且 `officialStatus = confirmed` 且未过期，取前 N（N 由 UI 决定）；只是排序视图，无独立数据（ADR 0003）。

### 5.4 slug

标题小写 → 非 `[a-z0-9]` 连续段替换为单个 `-` → 去首尾 `-` → 截断 80 字符。纯中文标题产出空串时 slug 为 null，URL 退化为 `/o/{record_id}`。slug 仅装饰：路由匹配只认 `recordId`，slug 不符时以 canonical 指向当前 slug（不做 301，保持无状态）。

## 6. Feishu adapter（`lib/feishu`）

- `POST /open-apis/auth/v3/tenant_access_token/internal` 获取 token；按 `expire` 提前 5 分钟过期，模块级内存缓存。
- 记录拉取用 Bitable records search 接口，`page_size=500`，循环处理 `has_more`/`page_token` 直到取完；对 429/5xx 做一次指数退避重试，仍失败则抛错交给快照层（继续用旧快照）。
- 每次刷新先拉字段列表，校验 4.1 所需字段是否存在；缺失关键字段（活动名称、报名入口、截止时间）时中止刷新并记日志，不产出残缺快照。
- 高级权限警告：接口成功但 0 条记录时按刷新失败处理（ADR 0016）。

## 7. 快照层（`lib/snapshot`）

`getSnapshot()` 行为（ADR 0016）：

1. 实例内存有未过期快照 → 直接返回。
2. 读 Blob：新鲜 → 存内存并返回；stale → **立即返回旧数据**，同时用 `after()` 调度后台刷新（实例内 in-flight 标志防重复）。
3. Blob 缺失 → 同步刷新（唯一阻塞路径），失败则抛错（页面显示友好错误态）。

返回值附带 `isStale: boolean` 与 `generatedAt`，页面 footer 展示"数据更新于 X 小时前"。

## 8. 路由表

| 路由 | 渲染 | 缓存 | 职责 |
|---|---|---|---|
| `/` | redirect | — | 301 → `/zh` |
| `/[locale]` | RSC + 客户端筛选岛 | `revalidate = 300` | 服务端渲出全部非过期机会的卡片与链接（SEO/内链发现）；快照数据一次性传给客户端组件做交互筛选（ADR 0015） |
| `/[locale]/categories` | RSC + 客户端筛选岛 | `revalidate = 300` | 顶层分类浏览页；按用户目标和字段组合派生分类，不生成 per-tag 页面（ADR 0010） |
| `/[locale]/o/[recordId]/[[...slug]]` | RSC | `revalidate = 3600`，`dynamicParams = true`，不做 `generateStaticParams` | 找不到 record → 404；已过期 → 正常渲染 + 显著过期标识；`generateMetadata` 输出双语 metadata；只序列化本条记录 |
| `/go/[recordId]` | route handler | `dynamic = 'force-dynamic'` | 从快照解析 `registrationUrl`，记录点击日志，302 跳转；未知 id → 404。禁止接受任何 URL 参数（ADR 0014） |
| `/[locale]/about|contact|privacy|terms` | 静态 RSC | 静态 | AdSense 前置要求（ADR 0012） |
| `robots.ts` / `sitemap.ts` | — | — | sitemap 只列 locale 根页、分类页和静态页，不含详情页 |

列表页筛选状态（类型、地区、奖励类型、状态、搜索词）同步到 URL query（`useSearchParams` 只在筛选岛内读写），保证可分享；服务端渲染忽略 query，始终渲全量，筛选纯客户端。

## 9. i18n 规格

- next-intl，`[locale]` 段，支持 `zh`、`en`；非法 locale → 404。
- UI 文案在 `messages/*.json`；枚举 label 走 `enums.ts`（数据侧双语），不进 messages。
- 活动长文本保留中文原文；`en` 路由下这些区块加 `lang="zh"` 属性并可加"原文为中文"提示（ADR 0011）。
- 日期格式化用 `Intl.DateTimeFormat`（`zh-CN` / `en-US`），时区 `Asia/Shanghai`。

## 10. SEO 规格

- 每页输出：localized `title`/`description`、canonical、`hreflang`（zh/en/x-default）、Open Graph。
- Event JSON-LD 仅当记录同时满足：`type ∈ {hackathon, ai-competition, dev-challenge}`、`startAt` 与 `endAt` 均存在、有 `registrationUrl`。其余类型不输出 JSON-LD（ADR 0012）。
- 过期详情页保持可索引，页面明确标注过期状态。

## 11. Analytics

- Vercel Analytics（`@vercel/analytics`），dynamic import + `ssr: false`。
- 自定义事件：`detail_view`（详情页）、`outbound_click`（在 `/go` route 服务端记结构化日志，同时客户端点击时发事件）、`filter_use`（筛选岛内节流上报）。
- 不引入 cookie banner 需求的追踪方案（ADR 0013）。

## 12. 测试要求（Vitest，只测 lib）

- `mapper.test.ts`：基于真实 fixture，覆盖日期、单选、多选、星级解析、畸形 URL、空字段、未知枚举值、剔除规则。
- `derive.test.ts`：五种截止分桶的边界（含恰好 3/7 天）、公开状态、排序稳定性、slug（英文、中英混合、纯中文、超长）。
- `outbound.test.ts`：合法 id 解析、未知 id 404、确认无任意 URL 注入路径。
- 快照层的记录数保护逻辑（50% 规则）单测。

## 13. 分阶段交付

### Phase 0 — 数据链路验证（前置阻塞：需要 `FEISHU_APP_TOKEN`）

- [x] `scripts/dump-snapshot.ts`：读 env → token → 字段列表 → 分页全量拉取 → mapper → 输出 `Snapshot` JSON 到本地。
- [ ] 将一份真实响应脱敏后存为 `tests/fixtures/feishu-records.json`。
- [ ] 报告：记录总数、剔除数及原因分布、快照 JSON 体积（gzip 前后）、live 字段与 4.1 模型的差异。
- **验收**：脚本一键产出合法快照；体积若超 500KB（gzip 前）需回报用户重估全量下发决策，不得自行改架构。

### Phase 1 — 核心链路

- [x] `lib/` 全部模块 + 单测通过。
- [x] 快照管道接 Vercel Blob，SWR 语义按第 7 节实现。
- [x] 列表页、分类页、详情页、`/go` 跳转。
- [x] 双语路由骨架和当前 UI 文案。
- **验收**：Vercel preview 上完整走通 发现 → 筛选 → 详情 → 跳转官方页；禁用 JS 后列表页与详情页内容和链接仍完整可见（SSR 验证）；`pnpm test` 全绿。

### Phase 2 — 双语与 SEO

- [ ] en 文案补齐、枚举双语 label 全覆盖。
- [ ] metadata/hreflang/canonical/OG/robots/sitemap；合格记录的 Event JSON-LD。
- [ ] About / Contact / Privacy / Terms 双语页。
- **验收**：Google Rich Results 测试通过；用 curl 检查两种 locale 的 head 输出正确。

### Phase 3 — 上线

- [ ] 域名与 DNS（Cloudflare）、生产部署、Analytics 事件验证、Search Console 提交。
- [ ] 快照刷新失败的结构化日志可在 Vercel 日志中检索。
- **验收**：生产域名可访问，analytics 收到三类自定义事件。

## 14. 禁止事项（未提出新 ADR 前一律不做）

数据库、ORM、定时任务、队列；Hono 或独立 API 服务；账号/登录/收藏/提醒；管理后台、CMS、提交表单；服务端搜索或外部索引；自动翻译活动长文本；详情页动态 sitemap；AdSense 代码；接受任意 URL 的跳转参数；把 Feishu 凭证或 Base token 写进代码仓库。
