## Work-item state

The work item is the shared feature document at `.ai/work/<work-id>.md` in the active checkout.
Use it for planned, parallel, or multi-session work; the skill defines when planning requires it.
A direct-builder change may remain file-free
until analysis, repeated uncertainty handoffs, or another session requires persistence.

Use a stable, lowercase, hyphenated feature name independent of branch and path. If occupied by
another item, append the smallest available numeric suffix; never overwrite it. Recognize
legacy `.ai/work/<branch-slug>.md` files without silently renaming or migrating them.
Multiple work items may coexist.

## Selection and resume

At entry and resume, read the current branch and short Git status. Preserve unrelated changes;
overlapping dirty changes block dependent work. Select the item in this order:

1. Explicit work ID supplied by the user or resumed state.
2. One nonterminal item matching the current worktree or branch.
3. The only nonterminal item in the active checkout.
4. Otherwise ask which plausible item to resume; do not revive completed work automatically.

After compaction, reload the skill and selected item before acting. Restore approvals rather
than repeating them; follow the skill's recovery checkpoint for missing evidence and dispatch.
An explicit request may inspect a terminal item; reopen it only for requested follow-up work.

```yaml
---
work_id: guest-checkout
title: Guest checkout
status: design
branch: feature/guest-checkout
worktree: /actual/path/to/selected/checkout
lifecycle_owner: codex
---
```

Omit unavailable checkout metadata. `lifecycle_owner` identifies the managing user or harness,
not authority to change workspaces. Legacy records may retain a `route` field and missing
metadata; do not rewrite them solely to adopt new terminology.

Use the current gate as status: `design`, `definition-approved`, `analysis`, `analysis-approved`,
`building`, `review`, or `accepted`. `paused` and `blocked` remain resumable. Terminal statuses are
`completed` (requested endpoint satisfied without shipping), `shipped`, and `cancelled`.
Legacy `discovery`, `planning`, and `plan-approved` remain valid. A missing check or approval
never qualifies as completion.

## Checkout ownership

Work in the current checkout by default. Never create, switch, attach, or clean up worktrees
automatically. Workspace changes require an explicit user request. This also applies when the
harness has no native worktree manager; task size, risk, and parallelism grant no authority.
Always keep `.ai/work/` inside the current checkout, never under global harness configuration.

For an authorized workspace change, use the harness lifecycle when available. Without a manager,
direct non-forced Git worktree commands require visible approval. Workers have no lifecycle
authority. Record the actual new path and manager after an approved change.

Recorded checkout metadata is resume context, not a workspace-switch instruction. If the stored
path differs, stop before dependent work and ask the user to resolve the mismatch or explicitly
request a workspace change. There is no automatic creation fallback.

## Dispatch and delivery contract

For every delegation, project a minimal ephemeral envelope: assignment and requested endpoint,
active checkout, applicable `AGENTS.md` constraints, relevant decisions/evidence, exact owned paths
for writers, peer boundaries, and completion criteria. Include only what that role needs; never
send the full work item or unrelated history. Use each role's skill for its procedure and return
format. Insufficient authority or a missing decision returns to the coordinator; focused reads
needed to carry out the assignment remain allowed within role authority.

A builder envelope for designed or analyzed work identifies the saved work-item path and section
or task ID and includes the relevant task text, decisions, acceptance scenarios, dependency
outputs, exemplar when known, and verification contract. A link alone is insufficient.
Direct-builder bounded work may use a self-contained file-free assignment.

Reviewers receive the target diff, accepted intent, relevant constraints, and available evidence;
change-delivery review also requires the documentation/ADR assessment and closeout evidence.
Shippers receive approved scope, commit groups, branch, remote, and gate evidence.

Every worker return updates `## Delivery state` before the next dispatch. After each task or
parallel group, check fresh short status and worker reports for scope and completion; the
reviewer owns diff inspection. Keep writer paths disjoint and serialize shared-document edits.

## Compact checkpoint

Keep only applicable sections: `## Leadership brief` (deliverable and stopping point),
`## Discovery map`, `## Approved definition`, `## Decisions and assumptions`,
`## Implementation plan`, `## Delivery state`, `## Verification`, `## Review`, and
`## Acceptance and shipping`. Save role contributions in place, not as a transcript. Proposed
choices, approvals, and unknowns stay distinct. Use stable decision/task/acceptance/commit IDs
only when later sections reference them. A bounded change may contain one task and its checks.

Keep current blockers and the next task explicit. For example:

```text
Last handoff: analyst T1 — brief saved; permission-hook behavior remains unknown
Next: explorer — confirm the hook before analyst resumes
Pending: analysis, verification, documentation/ADR assessment, review, shipping approval
Documentation: pending assessment
ADRs: D1 approved — .ai/adrs/role-boundaries.md pending maintenance
```

Store returned evidence and actual role invocations, not intentions or duplicated task text.
File-free work uses the same compact checkpoint in the handoff summary. Documentation categories
stay pending until their owned paths and evidence or reasoned `not needed` assessment are recorded.
The feature document retains feature-specific intent and delivery evidence; living ADRs retain
approved cross-task decisions and rationale.
