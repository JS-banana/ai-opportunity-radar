# Client-side discovery for MVP

The MVP will return the full activity opportunity snapshot to the browser and perform search, filtering, sorting, categorization, tags, deadline buckets, and deterministic recommendation on the client. Deadline states such as ending in 7 days or 3 days are derived from the activity end time in the browser, not stored as separate source fields. Server-side search or an external index is deferred until snapshot size, query latency, or SEO requirements make client-side discovery insufficient.
