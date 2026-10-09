# Portable procedures and bounded worker context

Scope: role authority, skill loading, generation, and implementation briefs.

## Decision

Keep role authority in generated native kernels and procedure in explicitly loaded portable
skills. `workflow/manifest.json` maps orchestrator, designer, analyst, explorer, archivist, builder,
reviewer, and shipper to `codavio-orchestrate`, `codavio-design`, `codavio-analyze`, `codavio-explore`,
`codavio-archive`, `codavio-build`, `codavio-review`, and `codavio-ship`. Reload active orchestration on every turn.
Restore the work item after compaction and before phase transitions. Create it before design or
analysis begins, and persist each worker handoff with evidence, unfinished gates, and the next
role. Missing evidence keeps work pending rather than granting the coordinator authority to
substitute for a worker.
In Codex, bundle a small resume/compaction hook that restores the canonical coordinator kernel
as developer context and asks an active workflow to reload its skill and work checkpoint.
The hook is conditional guidance, not automatic workflow activation or a tool blocker, and uses
Codex's normal hook trust review. Do not duplicate the authority kernel in the adapter.

Designer or analyst involvement requires one evolving feature document in the canonical work
item, regardless of perceived difficulty or task size, combining the user's intent,
designer definition, analyst implementation brief, decisions, resolved edge cases, and delivery
evidence. Designer and analyst skills define their contributions; the coordinator saves them and
projects minimal role-specific envelopes rather than sending workers the whole document or
decision collection. Storage and resume guidance is internal support, not a separate deliverable
or document-approval ceremony. Material questions return to the user and update the same document.

## Context and rationale

These choices were recorded in memory and support the repository's goal of predictable behavior
with cheaper models: one canonical source per concern, explicit boundaries, and bounded context.

## Alternatives and consequences

Duplicated harness procedures can diverge. Entire-work-item payloads expose irrelevant history.
Portable skills need explicit loading and generator alignment; deviations change routing rather
than granting broader authority. The work item holds delivery planning while ADRs hold cross-task
decisions.
Repeated analysis can outlast conversation context; recording the brief only after analysis
finishes loses the very state needed to resume it. Compact handoff checkpoints retain that state
without passing the whole conversation to workers. These procedures remain model-followed where
the harness lacks a runtime guard; generated instructions alone are not mechanical enforcement.

## Reconsideration

Revisit if a harness cannot load procedures reliably or focused envelopes repeatedly omit required
evidence. Canonical generation rules are documented in `workflow/capabilities.md`.
