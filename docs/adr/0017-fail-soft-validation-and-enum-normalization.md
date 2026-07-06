# Fail-soft validation and enum normalization

The Feishu Base is human-curated and its select fields carry historical noise: `难度评级` has duplicate legacy options, `推荐指数` is a star-string select rather than a number, `报名入口` is URL-style text that may be malformed, and new select options can appear at any time.

The derive step validates each record against a schema (Zod) at the Feishu adapter boundary. Validation is fail-soft per record: an invalid record is skipped and logged with its `record_id` and reason, and never fails the whole snapshot. Enum-like fields are normalized through explicit in-code maps — star strings to numeric scores, legacy difficulty options to the five canonical levels, select values to stable internal enum keys that the UI translates per locale. Unknown select values fall back to a generic bucket (rendered as the raw source text) instead of being dropped, so a new option added in Base degrades gracefully rather than hiding records.

Records missing a hard requirement for display — no title or no valid registration URL — are excluded from the snapshot. The mapper ships with a fixture test covering dates, single/multi selects, star parsing, malformed URLs, empty fields, and expiry derivation, as required by the implementation checkpoints.
