## Work-item state

Use `.ai/work/<work-id>.md` for planned, parallel, or multi-session work. A work ID is a
stable, lowercase, hyphenated feature name such as `guest-checkout`; it is not derived from
the Git branch. If the preferred slug belongs to a different item, append the smallest
available numeric suffix without adding an approval gate. Never overwrite another work item.

At entry and resume, read the current branch and short Git status, then select the matching active
work item using the rules below. Resume its compact recorded state instead of repeating completed
approvals. Preserve unrelated user changes; stop and report the conflict when dirty changes overlap.
Create the work item only for planned, parallel, or multi-session work.

Resolve the active work item in this order:

1. an explicit work ID supplied by the user or resumed state
2. one item whose metadata matches the active worktree or branch
3. the only nonterminal item in the active worktree
4. otherwise list the plausible items and ask which one to resume

Recognize legacy `.ai/work/<branch-slug>.md` files when they match the current branch. Preserve
them and offer a feature-name migration when the item next becomes active; never overwrite or
silently rename runtime state.

Start a new work item with compact metadata:

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

Omit unavailable branch, worktree, or lifecycle owner values, including for a new project.
`worktree` records the current checkout path, not a path derived from the work ID or branch.
When known, `lifecycle_owner` records the user or harness that manages the checkout; it grants
Codavio no automatic lifecycle authority. Keep the work ID independent of branch and path.
Legacy records may retain a `route` field; do not migrate or reinterpret it, and do not write
one for new work.
Existing records may omit checkout metadata; preserve them without forced migration.

Work in the current checkout by default. Never create, switch, attach, or clean up worktrees
automatically. Workspace changes require an explicit user request; task size, risk, parallelism,
session duration, and uncertain ownership are not authorization. This rule also applies when the
harness has no native worktree manager. Always keep `.ai/work/` inside the current checkout,
never under global harness configuration.

For an explicitly requested workspace change, use the active harness or workspace manager's
lifecycle when available. Only when no manager exists may the coordinator use direct Git worktree
commands, subject to visible command approval. Do not force mutations or bypass manager ownership.
Workers remain in their assigned checkout and have no lifecycle authority. After an authorized
workspace change, record the actual checkout path and known lifecycle owner in the active work item.
There is no automatic `.worktrees/` creation fallback or required worktree directory.

Recorded checkout metadata is resume context, not an instruction to switch workspaces. If a
resumed item's recorded `worktree` differs from the current checkout, stop before dependent work
and ask the user to resolve the mismatch or explicitly request the intended workspace change.

## Dispatch and delivery contract

For every delegation, project a minimal ephemeral envelope from the canonical work item and
include applicable `AGENTS.md` constraints. Builders receive one bounded task, only its referenced
decisions and acceptance scenarios, dependency outputs, exact owned paths, completion and
verification criteria, exemplary implementation when identified, and peer path boundaries.
Explorers receive only their purpose, focused questions, and necessary constraints. Archivists
receive affected concerns and questions for read-only discovery, or approved decision
content, implementation reports, verification evidence, and exact documentation ownership for
maintenance. Their source-linked briefs are projected into dependent workers' envelopes.
Integration builders receive completed-task summaries and the integration contract. Reviewers receive the
accepted definition and implementation brief, relevant ADRs, evidence, and complete diff. Shippers
receive the approved commit plan when one exists and shipping preconditions. Do not send the
entire work item, unrelated tasks, or history. Agents read further focused sources only when their
task genuinely requires it. If an envelope is insufficient, require the agent to report the exact
missing decision or evidence instead of broadening its context.

Builders own implementation and executable verification. They return the task ID, changed files,
checks, results, and remaining risk. After each task or parallel group, update `## Delivery state`
by task ID and check fresh short status plus the builders' returned reports for scope and
completion; do not read diff content. Stop for changed scope, paths outside owned scope, new
material decisions, worker failure, or unexpected required-check failure. Conflicting-edit and
content review belong to the reviewer. On conflicts or failures, report the blocker and stop
dependent work until the approved workflow resolves it.

Archivists own documentation discovery and edits, not material decisions or executable checks.
Record their changed paths, relevant decision references, inspection evidence, and gaps in the
same delivery state. Keep builder and archivist write scopes disjoint and serialize shared-doc edits.

Use the smallest status that describes the current gate: `design`, `definition-approved`,
`analysis`, `analysis-approved`, `building`, `review`, `accepted`, `shipped`, `paused`, or
`blocked`. Existing `discovery`, `planning`, and `plan-approved` values remain valid legacy state;
do not migrate them only to change terminology. Update metadata and compact sections in place
rather than appending a transcript.

Keep only applicable sections:

- `## Leadership brief`
- `## Discovery map`
- `## Approved definition`
- `## Decisions and assumptions`
- `## Implementation plan`
- `## Delivery state`
- `## Verification`
- `## Review`
- `## Acceptance and shipping`

For analyzed work, keep the durable implementation brief inside `## Implementation plan` using
only the applicable subsections from the analyst's output. A bounded change may contain one task
statement and verification contract rather than a formal graph. Use stable decision (`D1`), task
(`T1`), acceptance (`A1`), and commit-group (`C1`) IDs only when later sections need to reference
them. `## Delivery state` records compact status and evidence without copying task definitions.
For reliable resume, keep current blockers and the next task explicit and compact in delivery
state or the applicable recovery section; update them whenever work pauses, resumes, or advances.

When decisions require ADRs, record their paths and approval evidence in the applicable decision
or plan section; delivery state records documentation completion without duplicating ADR content.
Keep proposed choices distinct from current approved records. Work items hold delivery state;
living ADRs hold cross-task decisions, including relevant rationale recovered from legacy memory
or other project documentation.

The work file is the canonical delivery-planning artifact, not the default context payload. Coordinators
project only role-relevant sections into minimal task envelopes; they do not make workers read the
full file when a bounded projection is sufficient.

Multiple work items may coexist. Task size, risk, parallelism, and session duration do not
require a new checkout. Parallel writers in the current checkout require design-independent
work, explicit disjoint ownership, and no repository-wide side effects; otherwise serialize them.
