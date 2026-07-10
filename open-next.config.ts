import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// 全站 SSG：预渲染页面走免费静态资源通道，无 ISR、无队列、无 R2。
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
