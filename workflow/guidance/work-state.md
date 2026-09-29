## Work-item state

Use `.ai/work/<work-id>.md` for planned, parallel, or multi-session work. A work ID is a
stable, lowercase, hyphenated feature name such as `guest-checkout`; it is not derived from
the Git branch. If the preferred slug belongs to a different item, append the smallest
available numeric suffix without adding an approval gate. Never overwrite another work item.

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
route: FEATURE
status: discovery
branch: feature/guest-checkout
worktree: /actual/path/to/selected/checkout
lifecycle_owner: codex
---
```

Omit unavailable branch, worktree, or lifecycle owner values, including for a new project. Use
the manager's identifying name for `lifecycle_owner`, or `unmanaged` for the `.worktrees/`
fallback. `worktree` is the actual selected checkout path, not a path derived from the work ID or
branch. Keep the work ID independent of branch and path.

Existing records may omit `worktree` or `lifecycle_owner`; keep them valid and resolve ownership
prospectively when selecting a checkout. Do not migrate or overwrite their metadata just to add
these fields. For future work, first identify the active harness or workspace manager. Reuse only
a checkout that belongs to this project, is explicitly available to this task, has no conflicting
work, and has compatible branch and state. Do not infer manager ownership from a checkout path.
If the candidate is occupied, unsuitable, or ownership is uncertain, request a fresh checkout
from the manager; never repurpose it. Let the manager create, locate, attach, and clean up its
checkouts. Do not directly relocate, delete, or recreate a managed checkout. If needed isolation
is unavailable or incompatible, report that and stop before dependent work. Avoid nested isolation
inside a suitable isolated checkout. Only if no manager exists, use an unmanaged checkout under
the active project's ignored `.worktrees/` directory. Always keep `.ai/work/` inside the selected
checkout, regardless of its location.

For the unmanaged fallback, first confirm `.worktrees/` is ignored and the exact target
`<project-root>/.worktrees/<work-id>` is free. Then request visible approval for exactly one
direct command in one of these forms:

```sh
git worktree add -b <new-branch> <project-root>/.worktrees/<work-id>
git worktree add <project-root>/.worktrees/<work-id> <existing-branch>
```

Use the first form for a new branch and the second for an existing compatible branch. The Pi
guard accepts only these forms with a lowercase hyphenated work ID and a target directly under
the active project's `.worktrees/`; the permission system still asks before execution. Do not
use force, detach, alternate worktree options, wrappers, chained shell syntax, external paths,
or any other worktree mutation. If the target is occupied or `.worktrees/` is not ignored,
stop and report the blocker. Record `worktree` as the resulting checkout path and
`lifecycle_owner: unmanaged`.

When resuming an item with both fields, use its recorded `worktree` as the selected checkout and
its `lifecycle_owner` to determine who manages it. Route later location, attachment, or cleanup
through that owner; never infer a different owner from the path.

Use the smallest status
that describes the current gate: `discovery`, `definition-approved`, `planning`, `plan-approved`,
`building`, `review`, `accepted`, `shipped`, `paused`, or `blocked`. Update metadata and compact
sections in place rather than appending a transcript.

Keep only applicable sections:

- `## Leadership brief`
- `## Discovery map`
- `## Approved feature definition`
- `## Decisions and assumptions`
- `## Implementation plan`
- `## Delivery state`
- `## Verification`
- `## Review`
- `## Acceptance and shipping`

For planned work, keep every durable planning artifact inside `## Implementation plan` using
these stable subsections: `### Architecture decisions`, `### Task graph`, `### Integration
verification`, and `### Commit plan`. Use stable decision (`D1`), task (`T1`), acceptance (`A1`),
and commit-group (`C1`) IDs so later sections can reference rather than duplicate the planner's
task definitions. `## Delivery state` records compact status and evidence by task ID without
copying those definitions.

The work file is the canonical durable artifact, not the default context payload. Coordinators
project only role-relevant sections into minimal task envelopes; they do not make workers read the
full file when a bounded projection is sufficient.

Multiple work items may coexist. Material FEATURE implementation normally uses one branch and
isolated worktree per work item. Merely using separate files does not make parallel writes safe;
shared-worktree writers still require explicit disjoint ownership and no repository-wide side
effects.
