# AI 活动雷达 · Vercel 部署说明

本文面向需要将 **AI 活动雷达**（英文对外名 AI Opportunity Radar）部署到 Vercel 的维护者。站点为只读发现页：数据来自随仓库提交的 Feishu Base 快照（`src/data/snapshot.json`），报名跳转走官方页面。

代码仓库：[https://github.com/JS-banana/ai-opportunity-radar](https://github.com/JS-banana/ai-opportunity-radar)

---

## 1. 数据链路（ADR 0018）

```
Feishu Base ──(GitHub Actions 每天两次)──> src/data/snapshot.json ──(git push)──> Vercel 自动部署
```

- 快照是仓库的一部分，构建时静态 import；**Vercel 运行时不访问 Feishu，也不需要 Blob**。
- 同步 workflow：`.github/workflows/sync-snapshot.yml`（北京时间约 10:30 / 20:30，跟在 hermes 采集——每天 10:00 / 20:00 UTC+8——之后；也可手动 `workflow_dispatch` 触发）。
- workflow 在提交前运行 `pnpm test` 校验快照契约；同步失败或记录数异常缩水（< 上一份 50%）时不提交，线上继续用上一份快照。
- 已过期记录即使从 Feishu 清理，也会保留在快照中，由归档页 `/{locale}/archive` 展示。

## 2. 凭证配置

**Vercel 上不需要任何数据类环境变量。** Feishu 凭证只配置在 GitHub 仓库：

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | 必填 | 说明 |
|---|---|---|
| `FEISHU_APP_ID` | 是 | 飞书自建应用的 App ID。 |
| `FEISHU_APP_SECRET` | 是 | 飞书自建应用的 App Secret。 |
| `FEISHU_APP_TOKEN` | 是 | 多维表格 Base 的 **`app_token`（obj_token）**，来自 Base URL 中 `/base/` 后的一段。**不是** Wiki 节点的 `node_token`。 |

`FEISHU_TABLE_ID` 使用代码内默认值（`src/lib/env.ts`）；换表时再加 secret 并在 workflow 注入。

飞书侧要求：应用开通 `bitable:app:readonly` 且对目标 Base 有可读权限（同旧版说明）。

### 切勿提交到仓库

- `.env`、`.env.local` 等任何含密钥的文件
- `FEISHU_APP_SECRET` 等敏感值

`src/data/snapshot.json` 本身只含对外展示字段，随仓库公开是预期行为。

---

## 3. 部署方式

### A：Vercel Dashboard

1. **Add New → Project**，Import `JS-banana/ai-opportunity-radar`。
2. Framework Preset：`Next.js`；Package Manager：`pnpm`（自动识别）。
3. 无需配置环境变量，直接 **Deploy**。
4. 部署成功后用第 5 节 checklist 验收。

### B：Vercel CLI

```bash
vercel link
vercel          # 预览部署
vercel --prod   # 生产部署
```

---

## 4. 日常数据更新

- **自动**：等 workflow 定时跑；每次快照变化产生一个 `chore(data)` 提交并触发部署。
- **手动**：GitHub → Actions → "Sync Feishu snapshot" → Run workflow；或本地 `pnpm sync:snapshot`（读 `.env`）后自行提交。
- **监控**：workflow 失败会收到 GitHub 邮件通知；快照超过 24 小时未更新时，站点导航会显示「可能不是最新」。

---

## 5. 验收 checklist

| # | 检查项 | 预期 |
|---|---|---|
| 1 | 首页 `https://<domain>/zh` | 机会卡片为 live 数据（50+ 条未过期）。 |
| 2 | 导航栏数据时间 | 显示「数据更新于 …」，对应快照 `generatedAt`。 |
| 3 | 分类页 `/zh/categories` | 分类路径可点，结果区有真实计数。 |
| 4 | 归档页 `/zh/archive` | 展示已过期机会，按截止时间倒序。 |
| 5 | 详情页 `/zh/o/{recordId}/{slug}` | 从卡片点进可打开；metadata / 出站按钮正常。 |
| 6 | 出站 `/go/{recordId}` | 302 到该记录的 `registrationUrl`；伪造 ID 返回 404。 |
| 7 | 根路径 `/` | 重定向到 `/zh`。 |
| 8 | Actions | 手动触发一次 sync workflow，确认能成功提交或正确跳过。 |

---

## 6. 常见问题

### workflow 报 Feishu API error `99991672`（权限不足）

应用未开通 `bitable:app:readonly` 或未重新发布生效。飞书开放平台补权限后重跑 workflow。

### workflow 报记录数为 0 或拒绝覆盖

- `FEISHU_APP_TOKEN` 可能填了 `node_token`；用 Base URL 中 `/base/<app_token>` 段。
- 「Refusing to overwrite」表示本次拉取记录数少于上一份的 50%，多为权限回退；修复后重跑即可，线上不受影响。

### 数据长期不更新

- 检查 Actions 是否有失败运行（GitHub 会发邮件）。
- 检查 secrets 是否配置齐全。
- 注意：长期无 push 的仓库，GitHub 可能自动禁用 scheduled workflow，需手动重新启用。

### 构建失败

本地先跑：`rtk pnpm lint && rtk pnpm typecheck && rtk pnpm test && rtk pnpm build`；确认 Vercel 使用 pnpm。

---

## 7. 可选：自定义域名

1. Vercel 项目 → **Settings → Domains** → 添加域名，按提示配置 DNS。
2. `next-intl` 已配置 `/` → `/zh`；中英文路径分别为 `/zh`、`/en`。
3. 域名生效后重复第 5 节验收；接入 Google Search Console 时提交 `/sitemap.xml`。

---

## 相关文档

- 操作手册与边界：[`AGENTS.md`](../AGENTS.md)
- 架构决策：[`docs/adr/0018-git-committed-snapshot.md`](./adr/0018-git-committed-snapshot.md)
- 实施状态：[`docs/implementation-tracker.md`](./implementation-tracker.md)
