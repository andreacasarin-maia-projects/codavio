# Portable procedures and bounded worker context

Scope: role authority, skill loading, generation, and implementation briefs.

## Decision

Keep role authority in generated native kernels and procedure in explicitly loaded portable
skills. `workflow/manifest.json` maps orchestrator, designer, analyst, explorer, archivist, builder,
reviewer, and shipper to `codavio-orchestrate`, `codavio-design`, `codavio-analyze`, `codavio-explore`,
`codavio-archive`, `codavio-build`, `codavio-review`, and `codavio-ship`. Load orchestration on entry
and keep following it across active turns; reload after compaction or resume, or when its
procedure is missing from context, rather than rereading unchanged instructions on every message.
Restore the work item after compaction and before phase transitions. Create it before design or
analysis begins, and persist each worker handoff with evidence, unfinished gates, and the next
role. Missing evidence keeps work pending rather than granting the coordinator authority to
substitute for a worker.

All harnesses use `workflow/recovery.md` as the recovery reminder and the same work-item ledger.
OpenCode and Pi expose a main-session `codavio_session` tool for explicit activation and cleanup.
OpenCode's 2.x plugin stores activation by session ID and checkout in native plugin storage and
requires the root `orchestrator` agent. Pi stores native custom entries and reads only the current
session branch, validating session ID and checkout; child-agent processes register neither the
recovery tool nor the hook. Its coordinator shell guard uses that same state rather than
restricting every session that happens to load the package. Request-context hooks preserve
native summaries and restore registered workflow context without writing reminder turns into
history. Native agent or entry kernels already in context are not duplicated.
In Codex, bundle one `SessionStart` resume/compaction hook that restores the canonical coordinator kernel
as developer context and asks an active workflow to reload its skill and work checkpoint.
Explicit entry runs the bundled registration helper from the active checkout. It requires matching
`CODEX_SESSION_ID` and `CODEX_THREAD_ID` for the main session and stores a session-keyed marker
under `.ai/work/.codavio-sessions/` in that Git checkout. Completion at any requested endpoint,
pause, cancel, and exit run the same helper to clear activation. Registration and cleanup are
model-followed coordinator bookkeeping; failures must be reported. No feature document is
required solely for registration. Old plugin-data markers do not activate the new hook.
The recovery hook only reads this marker; unrelated sessions, other checkouts, missing identity,
and missing or invalid storage receive no output or writes. Native Codex dispatches `SessionStart`
only for root sessions; workers use `SubagentStart`, which is not registered. Codex still invokes
the guard wherever the plugin is enabled because there is no active-skill matcher. Do not infer
activation from a work item or parse unstable transcript formats. This is recovery guidance,
not a tool blocker, and uses Codex's normal hook trust review. Do not duplicate the authority
kernel in the adapter.

Designer or analyst involvement requires one evolving feature document in the canonical work
item, regardless of perceived difficulty or task size, combining the user's intent,
designer definition, analyst implementation brief, decisions, resolved edge cases, and delivery
evidence. Designer and analyst skills define their contributions; the coordinator saves them and
projects minimal role-specific envelopes rather than sending workers the whole document or
decision collection. Storage and resume guidance is internal support, not a separate deliverable
or document-approval ceremony. Material questions return to the user and update the same document.

Use the existing work item's `## Delivery state` as a per-task progress ledger, with state, actual
role/check evidence, and the next action. Update it before dispatch and immediately after every
worker return, verification, or review/fix round. Completion requires applicable checks, review,
and approval; missing evidence keeps work pending. Resume skips completed tasks with valid
evidence and continues interrupted rounds, reopening only invalidated obligations. Do not add a
second progress file or turn the ledger into an append-only transcript.

Scope the workflow to the requested deliverable. Review, research, and planning requests can
complete without implementation or shipping; finished work must not be selected automatically
for resume. Required checks and approvals still gate changes within scope. Keep instructions
narrow: authority in kernels, delivery routing in the skill, storage/recovery mechanics in its
reference, and shared quality, verification, and research policy in their canonical guidance.

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

A single Codex recovery hook replaces prompt tracking and its entry/exit regexes. Explicit lifecycle
registration keeps recovery scoped without appending reminder turns. This trades the
automatic prompt detector for a model-followed entry/cleanup step; the read-only guard cannot
recognize a completion that was never recorded. Per-task ledger evidence protects against
repeating work after context loss, while the hook restores the procedure needed to read it.

## Reconsideration

Revisit if a harness cannot load procedures reliably or focused envelopes repeatedly omit required
evidence. Canonical generation rules are documented in `workflow/capabilities.md`.
