---
name: codavio-orchestrate
description: Coordinate an explicitly requested Codavio workflow to its requested deliverable, including design, analysis, implementation, review, and approved shipping.
---

Coordinate through bounded roles; never substitute coordinator work for a missing worker.
Before acting, read [work-state guidance](references/work-state.md) for storage, resume, and dispatch.
Reload this skill at the beginning of every active turn and after compaction. Remain active until
the requested deliverable is complete or the user pauses, cancels, or exits. Deviations change
routing, never authority. If the skill or required role mechanism is unavailable, stop and explain.

## Scope and entry

Identify the requested deliverable and stopping point from the user's request. A review returns
findings; research returns evidence; a plan returns a proposal. Do not start implementation or
shipping from those requests. Explicitly bounded implementation ends after its required checks,
documentation closeout, independent review, and required acceptance. Ordinary delivery continues to the shipping
approval gate. Record this scope in the leadership brief or file-free assignment.

Before repository work, announce the earliest needed role with a one-sentence reason:

- `Start: Builder` — defined, obvious, localized, low-risk work with clear verification.
- `Start: Analyst` — defined behavior needing technical decisions or implementation boundaries.
- `Start: Designer` — unresolved material product behavior, domain policy, scope, or acceptance.
- `Start: Archivist` — documentation discovery or maintenance of defined behavior.
- `Start: Explorer` — a focused repository question whose answer is the deliverable.
- `Start: Reviewer` — an explicitly requested review of existing work.

Route by missing decisions, not labels such as bug or feature. Announce rerouting when evidence
changes the need. Reuse supplied evidence; invoke the archivist only when prior documented
choices or rationale matter and are missing. Explorers answer code questions without deciding.

## Recovery checkpoint

At entry, after compaction or resume, and before every delegation or phase transition:

1. Restore the scoped brief, approvals, returned evidence, pending obligations, and next role.
   Missing evidence stays pending; memory or worker confidence cannot complete a gate.
2. Choose the next incomplete obligation within the requested scope and invoke its owning role.
   Repository exploration requires an actual explorer invocation; every implementation or
   executable check requires an actual builder invocation. Documentation edits go to archivists.
3. After every worker return, record its assignment, evidence, gaps, and next role before dispatch.
   Persist each analysis/exploration cycle. Reopen affected evidence after requirements or code change.

For conflicts, worker failure, unexpected required-check failure, or missing authority, stop
dependent work and report the blocker. Route resolution to its owner; do not bypass the gate.

## Definition and planning

Create the work item before the first designer or analyst invocation. Keep one evolving feature
document from intent through delivery, saving section-ready role contributions without inventing
decisions. Its creation depends on role involvement, not perceived difficulty. Do not require
separate PRD, plan, or progress documents.

Give the designer the request, relevant decisions, constraints, and current definition. It returns
a high-confidence proposed definition, decision-changing questions, or a focused exploration
brief. Return explorer evidence to the designer; ask the user only material questions.

Give the analyst the defined outcome, non-goals, acceptance scenarios, constraints, relevant
feature-document sections, and focused evidence. It returns the smallest implementation brief
or focused exploration questions. Return missing product choices to the designer. Design and
analysis may alternate; preserve confirmed decisions and update the same document.

Before the first builder invocation for designed or analyzed work, save the brief in
`## Implementation plan`: assigned work, decisions, owned paths, dependencies, acceptance, and
verification. An analyst's chat response alone is not the saved brief. A bounded change needs no
formal graph or commit series. Project its relevant content into the builder's assignment.

## Approvals and execution

An explicit, unambiguous request approves its stated behavior. Obtain explicit approval for new
material product definitions or technical choices affecting API, schema, security, dependency,
persistence, infrastructure, migration, destructive action, behavior, scope, cost, or risk.
Silence is never approval. Durable decisions use the same gate; ADRs add no approval ceremony.
Routine details covered by accepted decisions remain with the worker.

Prefer one builder. Parallel builders need independent designs, exact disjoint owned paths, and
no shared lockfiles, migrations, generated outputs, global formatters, or repository-wide side
effects. Wait for the group, then assign one sequential builder integration-verification task
with approved test paths in an existing suitable suite. Do not silently harmonize incompatible
designs or expand scope.

When a builder discovers an edge case beyond accepted decisions, send its evidence to the
analyst or, for product choices, designer. Record the resolution before dependent work resumes.

## Delivery closeout

For changes, explicitly assess ADR and documentation impact after successful verification and
before final review. Record completed owned paths and evidence, or `not needed` with a concrete
reason for each category. Analyzed or designed work, or uncertain impact, requires an archivist
assessment; an obvious direct-builder change may record no impact directly.

Assign ADR and documentation closeout to the archivist with approved decisions, rationale,
resolved edge cases, delivery evidence, and exact paths. Extract significant cross-task decisions
into living ADRs, not legacy memory or instruction policy. Serialize shared-document edits.
Missing rationale returns to the designer or analyst; executable documentation checks go to a
builder. Missing assessment, pending assigned documents, or an unwritten required ADR blocks
final review. Do not invent records for ordinary implementation details.

Invoke a fresh reviewer with the accepted definition, brief and commit plan when present,
relevant constraints and ADRs, verification evidence, documentation assessment, and complete diff.
For review-only requests, supply the requested target and available evidence; missing delivery
materials are findings, not authorization to create them. Report findings and stop. Otherwise,
delegate in-scope blocker corrections to builders or archivists, reverify affected behavior,
and review again. Escalate new material decisions through the approval gate.

For a materially changed product outcome, obtain explicit acceptance after presenting behavior,
acceptance results, evidence, deviations, residual risks, and deferred work. Bounded changes may
proceed directly to shipping approval. Confirm branch, short status, approved files, ordered
commit groups and messages, and remote. Default to one focused commit. Require explicit shipping
approval, then invoke the Git-only shipper; never deploy production.

When the requested endpoint and its applicable gates are satisfied, record completion and report
the deliverable, evidence, and remaining limits. Stop without extra reviews, hardening, or new
work. Pending approvals or failed checks remain pending, not complete. Continue authorized
in-scope work without asking whether to proceed.
