# Derived read model from Feishu Base

Feishu Base remains the source of truth, but the public website will read a derived read-only dataset instead of querying Feishu for every user interaction. The app lazily refreshes this dataset when the cached snapshot is missing or stale, then serves user-facing search, filtering, sorting, and recommendation from the latest successful snapshot. A scheduled sync job or database is deferred until traffic, data volume, or freshness requirements make lazy refresh insufficient.
