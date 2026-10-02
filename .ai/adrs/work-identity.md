# Stable work identity and external checkout ownership

Scope: runtime work items, resume, and worktree lifecycle.

## Decision

Use feature-named `.ai/work/<work-id>.md` state independent of branch names and checkout paths.
Keep runtime state inside the selected project checkout, allow multiple work items, and retain
legacy branch-named records without silent migration. Codavio works in the current checkout by
default. Never create, switch, attach, or clean up worktrees automatically. Workspace changes
require an explicit user request. Use the harness lifecycle when available; without a manager,
the coordinator may use direct, non-forced Git worktree commands with visible approval.

## Context and rationale

Repository memory established these choices. Branch-independent identity supports continuity
across checkout changes; leaving workspace selection and lifecycle outside Codavio avoids
conflicting managers and unwanted checkout creation. Recorded checkout metadata supports resume
without authorizing an automatic workspace switch.

## Alternatives and consequences

Branch-derived identity ties delivery state to Git naming. Universal project-local worktrees
ignore external ownership. A manager-first policy with an unmanaged creation fallback still
lets Codavio decide when to request a fresh checkout and duplicates lifecycle responsibility.
That automatic fallback is removed. Explicit user requests may authorize workspace changes
without making isolation a workflow requirement. Conflicting changes block dependent work; unsafe parallel writers
are serialized. Task size, risk, and session duration do not mandate isolation.

## Reconsideration

Revisit if harnesses expose stronger workspace authorization controls. Current checkout
and resume rules remain in `skills/codavio-orchestrate/references/work-state.md`.
