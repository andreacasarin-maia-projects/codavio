# One focused commit by default

Scope: implementation commit planning, review, and approved Git shipping.

## Decision

Default to one focused commit. The analyst may propose an ordered series when separation
materially improves comprehension, verification, or reversibility. The reviewer validates the
grouping against the final diff, and the Git-only shipper executes the approved grouping without
inventing boundaries. Include ADR and human-facing documentation changes with related behavior
unless the approved plan justifies a separate documentation group.

## Context and rationale

Memory established the single-commit default and bounded role ownership. Documentation grouping
follows the approved living-ADR workflow. The aim is understandable, reviewable delivery rather
than a mandatory commit taxonomy.

## Alternatives and consequences

A fixed multi-commit sequence can manufacture boundaries that the diff cannot represent cleanly.
Unconditionally combining everything can obscure independent changes. A justified series needs
explicit ownership and final-diff review; shipping still requires approval.

## Reconsideration

Revisit if repository review or release requirements demand different grouping. Procedures remain
in the analyze, review, and ship skills.
