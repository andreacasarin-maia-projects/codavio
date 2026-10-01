# Minimize maintained concepts and assess responsibility

Scope: analysis, implementation, and review of maintained code.

## Decision

Treat code as an ongoing liability. Prefer the smallest maintainable surface that satisfies
approved behavior, minimizing concepts and parallel paths rather than raw line count.
Approximately 500 human-authored lines in one file or refactor triggers a responsibility and
reviewability assessment, not automatic rejection.

## Context and rationale

This choice was recorded in memory and is expressed in shared code-quality guidance. The project
prioritizes predictable development and manageable cognitive load over speculative flexibility.

## Alternatives and consequences

Hard size limits can encourage fragmented micro-files; ignoring growth can obscure coupling and
multiple reasons to change. Responsibility-based assessment requires concrete evidence for
decomposition. Generated or cohesive declarative code may justify exceptions. Apply the guidance
to approved work without unrelated cleanup.

## Reconsideration

Revisit if responsibility assessment fails to identify recurring maintenance problems. Detailed
criteria remain in `workflow/guidance/code-quality.md`.
