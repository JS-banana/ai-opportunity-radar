# AI 活动雷达 · Vercel 部署说明

本文面向需要将 **AI 活动雷达**（英文对外名 AI Opportunity Radar）部署到 Vercel 的维护者。站点为只读发现页：数据来自 Feishu Base 快照，报名跳转走官方页面。

代码仓库：[https://github.com/JS-banana/ai-opportunity-radar](https://github.com/JS-banana/ai-opportunity-radar)

---

## 1. 前置条件

部署前请确认以下条件已满足：

| 项 | 要求 |
|---|---|
| **Feishu 自建应用** | 已创建并发布；开通 **`bitable:app:readonly`**（读取多维表格）权限；权限变更后需在飞书开放平台重新申请并等待生效。 |
| **Base 协作者** | 用于读取数据的应用（或应用所属租户）对目标多维表格 Base 具备**可读**权限；若 Base 开启高级权限，需显式授权，否则接口可能返回空数据。 |
| **Base 标识** | 能从 Base URL 取得 **`app_token`（obj_token）** 与 **`table_id`**；详见下文环境变量说明。 |
| **GitHub 仓库** | 已推送至 [JS-banana/ai-opportunity-radar](https://github.com/JS-banana/ai-opportunity-radar)，Vercel 可拉取代码。 |
| **Vercel 账号** | 已注册；建议与 GitHub 账号关联以便 Import 项目。 |
| **本地验证（推荐）** | 在仓库根目录配置 `.env` 后执行 `rtk pnpm dump:snapshot -- --out tmp/snapshot.json`，确认能拉到约 60 条记录且无异常 `skipped`。 |

---

## 2. 环境变量

所有变量均在**服务端**读取（`src/lib/env.ts`），**不要**使用 `NEXT_PUBLIC_` 前缀，**不要**提交到 Git。

在 Vercel：**Project → Settings → Environment Variables**，至少为 **Production** 配置；Preview 若需预览真实数据，也应配置相同变量。

| 变量 | 必填 | 说明 |
|---|---|---|
| `FEISHU_APP_ID` | 是 | 飞书自建应用的 App ID。 |
| `FEISHU_APP_SECRET` | 是 | 飞书自建应用的 App Secret。 |
| `FEISHU_APP_TOKEN` | 是 | 多维表格 Base 的 **`app_token`（obj_token）**，来自 Base URL 中 `/base/` 后的一段，例如 `https://xxx.feishu.cn/base/AbCdEfGhIj` → `AbCdEfGhIj`。**不是** Wiki / 文档节点的 `node_token`。 |
| `FEISHU_TABLE_ID` | 否 | 数据表 ID；代码默认 `tblYhMRh3fJ0FDfW`。仅当 Base 内换表时修改。 |
| `BLOB_READ_WRITE_TOKEN` | 生产强烈建议 | Vercel Blob 读写令牌。用于持久化 `snapshots/latest.json`，避免每次冷启动都打 Feishu。可在 Vercel 控制台创建 Blob Store 并关联项目后自动注入。 |
| `SNAPSHOT_TTL_HOURS` | 否 | 快照视为「新鲜」的小时数，默认 **6**。超过 TTL 后仍先读 Blob，再后台 SWR 刷新。 |
| `LOCAL_SNAPSHOT_PATH` | 否 | 仅本地开发用（默认 `tmp/snapshot.json`）；**Vercel 上无效**。 |

### 切勿提交到仓库

- `.env`、`.env.local`、`.env.production` 等任何含密钥的文件  
- `BLOB_READ_WRITE_TOKEN`、`FEISHU_APP_SECRET` 等敏感值  
- 本地导出的 `tmp/snapshot.json`（可 gitignore，仅作本地/CI 验收）

---

## 3. 部署方式 A：Vercel Dashboard

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)，点击 **Add New → Project**。  
2. **Import** Git 仓库 `JS-banana/ai-opportunity-radar`。  
3. **Framework Preset**：`Next.js`（通常自动识别）。  
4. **Package Manager**：`pnpm`（`package.json` 中 `packageManager` 为 `pnpm@11.7.0`，一般会自动选中）。  
5. **Build & Development Settings**（如需手动指定）：

   | 设置项 | 值 |
   |---|---|
   | Install Command | `pnpm install` |
   | Build Command | `pnpm build` |
   | Output Directory | 留空（Next.js 默认） |
   | Development Command | `pnpm dev` |

6. 展开 **Environment Variables**，填入第 2 节表格中的变量（至少 Feishu 四元组；生产建议同时配置 Blob）。  
7. （可选）在 **Storage → Blob** 创建 Store 并 **Connect to Project**，以自动获得 `BLOB_READ_WRITE_TOKEN`。  
8. 点击 **Deploy**，等待构建完成。  
9. 首次部署成功后，用第 6 节 checklist 验收生产 URL。

---

## 4. 部署方式 B：Vercel CLI

需已安装 [Vercel CLI](https://vercel.com/docs/cli) 并登录。

```bash
cd /path/to/ai-hackathons   # 或你的 clone 路径

vercel link                 # 选择或创建 Vercel 项目
vercel env pull .env.local  # 可选：拉取远程环境变量到本地
vercel                      # 预览部署
vercel --prod               # 生产部署
```

在 `vercel link` 之前，请先在 Dashboard 或通过 `vercel env add` 配置好 Feishu 与 Blob 变量。本地用 `rtk pnpm dump:snapshot` 验证凭证时，可复用同一套 `.env`。

---

## 5. 上线后数据链路

生产环境读取顺序（见 `src/lib/snapshot/get.ts`）：

```
内存缓存 → Vercel Blob → Feishu 实时拉取
```

说明：

- **无 `tmp/snapshot.json`**：Vercel 运行时不会读本地文件；未配 Blob 时，有 Feishu 凭证则直接调 Feishu 构建快照。  
- **已配 Blob**：请求先读 `snapshots/latest.json`；若 `generatedAt` 超过 `SNAPSHOT_TTL_HOURS`（默认 6 小时），标记为 stale，并在响应后通过 Next.js `after()` **后台刷新**（SWR），**无需重新部署**即可跟上 Base 更新。  
- **刷新保护**：若新快照记录数少于上一份的 50% 且上一份 ≥ 10 条，拒绝覆盖 Blob（防止权限静默失败写坏数据）。  
- **Blob 刷新失败**：不会覆盖上一份成功快照；错误记入函数日志。  
- **缺 Feishu 凭证**：回退到内置 `seedSnapshot`（**仅 6 条演示数据**）——生产环境必须配置 Feishu。  

### 首次冷启动行为

| 场景 | 首次请求表现 |
|---|---|
| 有 Feishu + 有 Blob（且 Blob 内已有快照） | 较快；直接读 Blob。 |
| 有 Feishu + 无 Blob / Blob 为空 | **较慢**：同步调用 Feishu 拉全量并尝试写入 Blob；可能接近 `dump:snapshot` 耗时。 |
| 无 Feishu | 立即返回 6 条 seed 数据（错误配置）。 |

建议在首次生产部署后：确认 Blob 已写入，或接受第一次访问略慢；之后由 TTL + 后台刷新保持数据新鲜。

---

## 6. 验收 checklist

部署完成后，将 `https://<your-project>.vercel.app` 替换为实际域名：

| # | 检查项 | 预期 |
|---|---|---|
| 1 | 首页 `https://<domain>/zh` | 机会卡片数量为 **50+**（当前 Base 约 61 条总量，其中约 50 条未过期）；**不是** 6 条 seed。 |
| 2 | 导航栏数据时间 | 显示「数据更新于 …」类文案，对应快照 `generatedAt`。 |
| 3 | 分类页 `/zh/categories` | 分类路径可点，结果区有真实计数。 |
| 4 | 详情页 `/zh/o/{recordId}/{slug}` | 从首页点进任意卡片可打开；metadata / 出站按钮正常。 |
| 5 | 出站 `/go/{recordId}` | 返回 **302** 到该记录在快照中的 `registrationUrl`；伪造 ID 返回 404。 |
| 6 | 根路径 `/` | 重定向到 `/zh`。 |
| 7 | 等价于 `dump:snapshot` | 本地用相同 env 执行 `rtk pnpm dump:snapshot -- --out tmp/snapshot.json`，`records` 与线上可见条数同一量级，`skipped: 0`（或 skip 原因可解释）。 |

可选：在 Vercel **Functions / Logs** 中确认无持续 `Feishu API error` 或 `Background snapshot refresh failed`。

---

## 7. 常见问题

### Feishu API error `99991672`（权限不足）

- **原因**：应用未开通 `bitable:app:readonly`，或开通后未重新发布/未生效。  
- **处理**：飞书开放平台 → 应用 → 权限管理 → 添加 **`bitable:app:readonly`** → 创建版本并发布 → 等待生效后重试 `dump:snapshot` 或重新访问站点触发刷新。

### `FEISHU_APP_TOKEN` 填错（`node_token` vs `obj_token`）

- **现象**：鉴权成功但记录数为 0，或 API 报错。  
- **处理**：打开多维表格 Base 浏览器地址，使用 `/base/<app_token>` 段作为 `FEISHU_APP_TOKEN`。**不要**使用 Wiki 文档 URL 里的 `node_token` 或云文档 token。

### 线上只有 6 条记录（Google GenAI Hackathon 等 seed 数据）

- **原因**：生产环境未配置或未正确加载 Feishu 四元组，站点回退到 `seedSnapshot`（`recordCount: 6`）。  
- **处理**：在 Vercel Production 环境补全 `FEISHU_APP_ID` / `FEISHU_APP_SECRET` / `FEISHU_APP_TOKEN` / `FEISHU_TABLE_ID`，**重新部署**或等待下次请求触发 Feishu 拉取；用第 6 节 checklist 复验。

### 未配置 `BLOB_READ_WRITE_TOKEN`

- **现象**：每次实例冷启动都可能同步打 Feishu；多区域/多实例时无法共享快照，延迟与 API 配额压力更大。  
- **处理**：Vercel 项目连接 Blob Store，或手动添加 `BLOB_READ_WRITE_TOKEN`；部署后访问一次站点，确认 Blob 路径 `snapshots/latest.json` 已写入。

### 快照长期不更新

- 检查 `SNAPSHOT_TTL_HOURS` 是否过大。  
- 检查 Feishu 凭证是否在 Production 生效（Preview 与 Production 环境变量相互独立）。  
- 查看日志是否有「拒绝覆盖」或 Feishu 错误；权限回退会导致刷新失败但旧 Blob 仍 served。

### 构建失败

- 本地先跑：`rtk pnpm lint && rtk pnpm typecheck && rtk pnpm test && rtk pnpm build`。  
- 确认 Vercel 使用 **pnpm** 而非 npm/yarn。

---

## 8. 可选：自定义域名

1. Vercel 项目 → **Settings → Domains** → 添加域名。  
2. 按提示在 DNS 服务商添加 **CNAME**（或 Vercel 要求的 A 记录）。  
3. 等待证书签发（通常数分钟）。  
4. `next-intl` 已配置 `/` → `/zh`；中英文路径分别为 `/zh`、`/en`，与域名无关。  
5. 域名生效后重复第 6 节验收；若计划接入 Google Search Console，在 Phase 3 中提交 sitemap（`/sitemap.xml`）。

---

## 相关文档

- 操作手册与边界：[`AGENTS.md`](../AGENTS.md)  
- 实施状态：[`docs/implementation-tracker.md`](./implementation-tracker.md)  
- 环境变量契约：[`docs/plan-02-build-spec.md`](./plan-02-build-spec.md) §2  
