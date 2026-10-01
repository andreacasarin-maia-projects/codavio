# Portable procedures and bounded worker context

Scope: role authority, skill loading, generation, and implementation briefs.

## Decision

Keep role authority in generated native kernels and procedure in explicitly loaded portable
skills. `workflow/manifest.json` maps orchestrator, designer, analyst, explorer, archivist, builder,
reviewer, and shipper to `codavio-orchestrate`, `codavio-design`, `codavio-analyze`, `codavio-explore`,
`codavio-archive`, `codavio-build`, `codavio-review`, and `codavio-ship`. Reload active orchestration on every turn.

Keep the smallest applicable implementation brief in the canonical work item; project minimal
role-specific envelopes rather than sending workers the whole work file or decision collection.

## Context and rationale

These choices were recorded in memory and support the repository's goal of predictable behavior
with cheaper models: one canonical source per concern, explicit boundaries, and bounded context.

## Alternatives and consequences

Duplicated harness procedures can diverge. Entire-work-item payloads expose irrelevant history.
Portable skills need explicit loading and generator alignment; deviations change routing rather
than granting broader authority. The work item holds delivery planning while ADRs hold cross-task
decisions.

## Reconsideration

Revisit if a harness cannot load procedures reliably or focused envelopes repeatedly omit required
evidence. Canonical generation rules are documented in `workflow/capabilities.md`.
