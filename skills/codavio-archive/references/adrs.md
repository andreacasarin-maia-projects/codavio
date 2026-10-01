## Living ADRs

Use repository ADRs for durable product, domain, architectural, or workflow decisions whose
non-obvious rationale or constraints will guide future work. Local implementation details,
task summaries, check results, and facts readily discoverable from code do not need records.
`MEMORY.md` is a legacy migration source, not the destination for new decisions. Applicable
`AGENTS.md` files, when present, govern instructions; they are not a project decision store.

Discover the repository's decision directory through documentation and file names. Follow its
established location; absent one, use `.ai/adrs/<stable-topic>.md`. Even without ADRs, search
relevant README files, design docs, legacy memory, code comments, and available work items for
prior decisions. Search titles, scope, and affected concerns, then read only relevant sources.
Do not load entire directories or Git history by default. Follow replacement links in historical
ADR collections. Distinguish approved choices, observed implementation, inference, and unknown
rationale; report conflicts rather than treating code or an old record as approval for a change.
Keep ADRs versioned; if `.ai/` is ignored, request a bounded builder change to include a narrow
exception for `.ai/adrs/` while keeping runtime `.ai/work/` state ignored.

For Codavio living ADRs, keep one stable file per significant decision or tightly related concern.
State the current approved decision, scope, context, rationale, relevant alternatives,
consequences, and conditions for reconsideration. Update that file when its decision changes;
retain earlier rationale only when it explains the current choice. Git preserves revision
history. Compact overlap and merge or remove records only when their guidance is redundant or
no longer applies; age alone is not grounds for removal. Follow an existing ADR lifecycle unless
the user authorizes changing it; do not silently convert immutable records.

Approval covers the material decision, not a separate documentation gate. An explicit request
may already authorize the change; otherwise route a material reversal for approval first.
Wording corrections and faithful compaction need no new decision approval. Never rewrite a
record to legitimize an unapproved implementation. Record only supported rationale; flag unknown
reasons during migration instead of inventing them.

When migrating memory, preserve still-relevant decisions in ADRs, merge overlap, and report stale
or conflicting entries. Leave instruction policy in its governing source and delivery state in
the work item. Stop writing new decisions to memory; remove the legacy file only when requested.
ADRs do not replace human-facing README, usage, or maintenance documentation; link shared
rationale rather than duplicating it.
