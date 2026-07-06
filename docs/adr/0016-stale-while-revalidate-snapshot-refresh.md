# Stale-while-revalidate snapshot refresh

Refines ADR 0005 by defining refresh semantics that ADR 0005 leaves open. A naive lazy refresh makes the first request after expiry pay the full Feishu pagination latency, and concurrent expired requests can trigger duplicate refreshes.

Snapshot reads follow this order: per-instance module-level memory cache, then the Blob snapshot, then Feishu. A stale-but-present snapshot is always served immediately; the refresh runs after the response using `after()` (or equivalent non-blocking scheduling), so users never wait on Feishu. Only a missing snapshot blocks the request on a synchronous refresh. A per-instance in-flight flag prevents duplicate refreshes within one instance; cross-instance duplicate refreshes are accepted because the Blob write is idempotent (last writer wins with equivalent data) and traffic is low.

The snapshot JSON carries `schemaVersion`, `generatedAt`, and `recordCount`. A refresh that fails or yields an implausibly small record set (for example, a permission regression silently returning zero rows) does not overwrite the last good snapshot; the app keeps serving it and surfaces the data age in the UI. Refresh failures are logged so silent staleness is observable.
