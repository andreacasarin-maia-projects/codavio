---
name: codavio-orchestrate
description: Coordinate an explicitly requested Codavio workflow to its requested deliverable, including design, analysis, implementation, review, and approved shipping.
---

Coordinate through bounded roles; never substitute coordinator work for a missing worker.
Before acting, read [work-state guidance](references/work-state.md) for storage, resume, and dispatch.
Load this skill on entry; reload it after compaction or resume, or when its procedure is missing from context.
Keep following it across active turns without rereading unchanged instructions on every message. Remain active until
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
   Read the delivery ledger before dispatch: retain completed tasks with valid evidence and resume
   an interrupted task at its recorded next action. Reopen only obligations invalidated by changed
   requirements, code, or verification conditions; do not replay the plan from conversation memory.
2. Choose the next incomplete obligation within the requested scope and invoke its owning role.
   Repository exploration requires an actual explorer invocation; every implementation or
   executable check requires an actual builder invocation. Documentation edits go to archivists.
3. Before dispatch, mark its task in progress; after every worker return, record its assignment,
   task state, evidence, gaps, and next role in the work item's `## Delivery state` before dispatch.
   Persist each analysis/exploration cycle. Reopen affected evidence after requirements or code change.

For conflicts, worker failure, unexpected required-check failure, or missing authority, stop
dependent work and report the blocker. Route resolution to its owner; do not bypass the gate.

## Definition and planning

Create the work item before the first designer or analyst invocation. Keep one evolving feature
document from intent through delivery, saving section-ready role contributions without inventing
decisions. Its creation depends on role involvement, not perceived difficulty. Do not require
separate PRD, plan, or progress documents.

Include relevant `## Discovery map` findings in each designer or analyst assignment. Before
dispatching an Explorer, check whether the map already answers the question. Ask only about
gaps, conflicting evidence, or findings made stale by changed code or conditions. Save each
Explorer return in the map before continuing dependent design or analysis.

Give the designer the request, relevant decisions, constraints, and current definition. It
challenges the proposed task against the intended outcome. It returns a high-confidence proposed definition,
decision-changing questions, or a focused exploration brief. Present its objective, materially
different approaches considered, and recommendation with the decisive tradeoff. Surface its
material questions and return answers and explorer evidence to the designer. Save the resulting
definition and obtain any required approval before dependent analysis.

Give the analyst the agreed objective, success criteria, selected approach and rationale when
defined, non-goals, acceptance scenarios, constraints, and relevant feature-document sections.
It returns a repository-grounded implementation plan or focused exploration questions. Return
new product choices to the designer with the evidence that raised them. Preserve confirmed
decisions and update the same document.

Before the first builder invocation for designed or analyzed work, save the brief in
`## Implementation plan`. For an analyst's plan, check that each implementation task names the
affected files or symbols, orders the changes, and ties checks to acceptance. Return missing
technical detail to the analyst. A bounded change needs no formal graph or commit series.

## Approvals and execution

An explicit, unambiguous request approves its stated behavior. Obtain explicit approval for new
material product definitions or technical choices affecting API, schema, security, dependency,
persistence, infrastructure, migration, destructive action, behavior, scope, cost, or risk.
Silence is never approval. Durable decisions use the same gate. Routine details covered by
accepted decisions remain with the worker.

For delivery based on an analyst's plan, present the saved plan for explicit user approval
before dispatching implementation. Share its work-item path and summarize the ordered changes,
scope, technical decisions, and verification so the user can approve or request revisions.
Resolve choices that prevent a complete proposal first. Present any remaining material
recommendations for approval with the plan. Acceptance of the product definition or an
individual technical decision does not approve the plan.

While plan approval is pending, stop implementation dispatch. When the user requests a
revision before implementation, mark approval pending and send the feedback to the analyst.
Route changes to product behavior through the designer first. Save and present the revised
plan with a summary of changes and wait for explicit approval of that revision. Reopen the gate
for later material changes to the approved plan before dependent edits. For a plan-only request,
deliver the plan at the requested endpoint and start no implementation.

Record approval of the presented plan revision in the work item before dispatch. On resume,
require recorded approval of the current plan before dispatching any dependent implementation.
Project the relevant approved steps, constraints, and checks into each builder assignment.

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
proceed directly to shipping approval.

Use the reviewer's evidence and commit grouping to propose an exact subject for each commit.
Follow the user's instructions and repository conventions. Default to `type: summary` with a
short imperative summary, such as `feat: require plan approval`. Use `feat` for features,
`fix` for bug fixes including urgent production fixes, `refactor` for refactors, `docs` for
documentation, and `chore` for maintenance. Add an optional component when it improves clarity,
as in `fix(recovery): restore approval state`.

Confirm the branch, short status, remote, and the ordered commits with exact messages and
approved files or hunks. Present one focused commit for a single theme or a reviewed series
for distinct themes. Require explicit shipping approval, then invoke the Git-only shipper
with the approved groups and messages. Never deploy production.

When the requested endpoint and its applicable gates are satisfied, record completion and report
the deliverable, evidence, and remaining limits. Stop without extra reviews, hardening, or new
work. Pending approvals or failed checks remain pending, not complete. Continue authorized
in-scope work without asking whether to proceed.
