# Enter the workflow according to uncertainty

Scope: selecting the initial role and changing routes as evidence develops.

## Decision

Ambiguous product or domain choices start with the designer; defined non-trivial changes start
with the analyst; obvious localized changes with clear verification start with the builder.
Documentation-only discovery or maintenance of defined behavior starts with the archivist.
New evidence may change the route without changing role authority.

## Context and rationale

This choice was recorded in repository memory and is implemented in the orchestration skill.
The project's goal is predictable execution with minimal per-agent context. Routing by missing
decisions concentrates work on the uncertainty that actually needs resolving.

## Alternatives and consequences

Routing every request through design and analysis adds unnecessary procedure. Routing by labels
such as bug or feature does not establish whether behavior or implementation is understood.
The coordinator must assess uncertainty and announce its entry choice.

## Reconsideration

Revisit if repeated misrouting exposes a missing criterion. The procedure lives in
`skills/codavio-orchestrate/SKILL.md`; this record explains the decision rather than duplicating it.
