# Lazy TTL snapshot cache

The MVP will store the latest successful derived dataset as a JSON snapshot in Vercel Blob with a default freshness window of about 6 hours. When the snapshot is missing or stale, the next request refreshes it from Feishu Base; if refresh fails, the app continues serving the previous successful snapshot and marks it stale. Runtime memory and CDN responses may cache the snapshot, but local serverless memory is not the durable source.
