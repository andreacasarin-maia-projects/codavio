# One focused commit by default

Scope: implementation commit planning, review, and approved Git shipping.

## Decision

Default to one focused commit for a single theme. Group distinct, separately reviewable themes
into an ordered series when the diff supports that split. The analyst may propose the series
in the plan. The reviewer confirms or recommends grouping against the final diff, and the
coordinator presents the groups and exact messages for shipping approval. The Git-only shipper
executes the approved series. Include tests, ADRs, and documentation with the behavior they
support. Use a short typed commit subject by default.

## Context and rationale

Memory established the single-commit default and bounded role ownership. Documentation grouping
follows the approved living-ADR workflow. Grouping by theme makes review and selective reversion
easier. Typed subjects make history easier to scan and can follow project-specific conventions.

## Alternatives and consequences

A fixed multi-commit sequence can manufacture boundaries that the diff cannot represent cleanly.
Unconditionally combining everything can obscure independent changes. A justified series needs
explicit ownership and final-diff review; shipping still requires approval.

## Reconsideration

Revisit if repository review or release requirements demand different grouping. Procedures remain
in the analyze, review, orchestrate, and ship skills.
