# Cloudflare Workers 部署

2026-07-10 起生产部署从 Vercel 迁至 Cloudflare Workers（免费版）。动机：静态资源请求免费不限量、无带宽上限、无 Hobby 非商业条款风险；国内外访问与 Vercel 同档（均无大陆节点）。

## 架构

- 适配器：`@opennextjs/cloudflare`，配置见 `open-next.config.ts`（`staticAssetsIncrementalCache`，纯 SSG）。
- Worker：`airadar`（account `282cd9a768a83ad2b53489f6263af145`），配置见 `wrangler.jsonc`。
- 全站页面预渲染为静态资源，走 Cloudflare 免费不限量的 Static Assets 通道；仅 `/go/{recordId}`（302 跳转）和未预渲染的详情路径消耗 Worker 请求额度（免费版 10 万次/天）。
- ISR 已移除：数据更新靠 `sync-snapshot.yml` 每天两次提交快照触发全量重建，不需要运行时再验证，因此无需 R2 / Queues / Durable Objects。
- 域名：`airadar.laifuyou.com` 以 Workers Custom Domain 方式绑定（laifuyou.com zone 本就托管在 Cloudflare）。

## 部署方式

- 自动：push 到 `main` 触发 `.github/workflows/deploy.yml`（测试 → OpenNext 构建 → `opennextjs-cloudflare deploy`）。Secret：`CLOUDFLARE_API_TOKEN`（Edit Cloudflare Workers 模板）。
- 本地：`pnpm deploy`（需 `wrangler login`）；`pnpm preview` 在本地 workerd 中预览。

## 约束与注意

- Worker 包免费版限 3MB gzip，当前约 1.9MB；接近上限时先查依赖再考虑拆分。
- `workers.dev` 域名在大陆被墙，验证国内访问需用正式域名。
- 免费版大陆流量路由到美西节点（150–300ms），属正常调度非故障。
- 回滚：Vercel 项目未删除；在 Cloudflare DNS 把 `airadar` 记录改回 CNAME `f6f031918e738ced.vercel-dns-017.com`（DNS only 灰云）即切回 Vercel。参考 `docs/vercel-deploy.md`。
