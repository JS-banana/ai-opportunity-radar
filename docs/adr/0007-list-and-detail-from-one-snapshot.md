# List and detail from one snapshot

The MVP will include both a discovery list and an activity opportunity detail page, but both views read from the same derived snapshot. List items show decision-critical fields: title, vendor, type, score, reward summary, deadline bucket, region, difficulty, official status, and registration entry. Detail pages show the fuller Base-derived record: reward details, participation method, winning criteria, timeline notes, start and end time, format, estimated effort, source channel, public status, official status, and registration entry.

Public status is derived for users as `进行中`, `即将截止`, `长期`, or `已过期`; internal management states such as `已报名` and `已跳过` are not shown directly. A CMS, separate detail datastore, or editorial article model is deferred until the product needs authored content beyond the Feishu Base fields.

Expired opportunities are hidden from the default discovery list but remain accessible through filters and direct detail URLs. Detail pages for expired opportunities clearly mark the expired status and keep the official link for reference.
