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
worktree: .worktrees/guest-checkout
---
```

Omit unavailable branch or worktree values, including for a new project. Use the smallest status
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
