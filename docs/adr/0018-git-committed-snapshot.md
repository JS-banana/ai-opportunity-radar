# Git-committed snapshot via GitHub Actions

Supersedes the earlier Blob snapshot store and stale-while-revalidate refresh decisions (former ADR 0005 / 0016, since removed).

The derived snapshot now lives in the repository at `src/data/snapshot.json` and is statically imported at build time. A GitHub Actions workflow (`.github/workflows/sync-snapshot.yml`) runs twice daily after the upstream hermes collection, pulls the full Feishu Base, validates it against the test suite, and commits the result; the push triggers a Vercel deploy, so a deploy is the data refresh.

Consequences:

- The runtime has no Feishu or Blob dependency: no credentials on Vercel, no cold-start fetch, no SWR refresh path. `@vercel/blob` is removed.
- Data freshness is bounded by the sync cadence (~12h), which matches the upstream collection cadence. A snapshot older than 24h renders the existing stale indicator, signalling a broken sync.
- An invalid snapshot cannot take down production: the workflow runs `pnpm test` before committing, and a bad commit would fail the Vercel build, leaving the previous deploy live.
- Expired records removed from Feishu are preserved in the snapshot as an archive (merge in `scripts/sync-snapshot.ts`); records that disappear from Feishu while still active are treated as manual deletions and dropped. The zero-record and implausibly-small guards from ADR 0016 are kept in the sync script.
- Full-table pull is retained deliberately: at the current scale (~60 records) one paginated search request fetches everything, so incremental per-record fetching would add requests and complexity without benefit.
