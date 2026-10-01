# Stable work identity and managed checkout ownership

Scope: runtime work items, resume, and worktree lifecycle.

## Decision

Use feature-named `.ai/work/<work-id>.md` state independent of branch names and checkout paths.
Keep runtime state inside the selected project checkout, allow multiple work items, and retain
legacy branch-named records without silent migration. The active harness or workspace manager
owns checkout lifecycle. Use `.worktrees/` only when no manager exists.

## Context and rationale

Repository memory established these choices. Branch-independent identity supports continuity
across checkout changes; respecting manager ownership avoids conflicting lifecycle mechanisms.

## Alternatives and consequences

Branch-derived identity ties delivery state to Git naming. Universal project-local worktrees
ignore active manager ownership. The chosen approach requires explicit checkout metadata and
safe resume selection. Unmanaged fallback creation remains coordinator-only, limited to the
two narrow project-local `git worktree add` forms, with visible approval where arguments cannot
be enforced. This grants no cleanup or migration authority.

## Reconsideration

Revisit when a supported harness changes lifecycle guarantees. Exact creation, ownership, and
resume rules remain in `skills/codavio-orchestrate/references/work-state.md`.
