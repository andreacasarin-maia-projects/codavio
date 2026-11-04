# Minimize maintained concepts and assess responsibility

Scope: analysis, implementation, and review of maintained code.

## Decision

Treat code as an ongoing liability. Prefer the smallest maintainable surface that satisfies
approved behavior, minimizing concepts and parallel paths rather than raw line count.
Prefer existing native and maintained capabilities before custom implementation; exceptions need
a concrete gap and a proportionate comparison of integration and maintenance costs. Research and
verification stop when sufficient evidence satisfies the decision or required outcome.
Approximately 500 human-authored lines in one file or refactor triggers a responsibility and
reviewability assessment, not automatic rejection.

## Context and rationale

The project prioritizes predictable development and manageable cognitive load over speculative
flexibility. A reuse preference delivered only to builders arrives after technical choices have
been made. Shared code-quality guidance reaches analysts, builders, and reviewers; research
guidance resolves external capability questions before implementation.

## Alternatives and consequences

Hard size limits can encourage fragmented micro-files; ignoring growth can obscure coupling and
multiple reasons to change. Responsibility-based assessment requires concrete evidence for
decomposition. Generated or cohesive declarative code may justify exceptions. Apply the guidance
to approved work without unrelated cleanup.
Neither mandatory ecosystem surveys nor automatic package adoption minimize maintenance cost.
Focused research can justify existing tooling or small custom integration; it need not establish
that no alternative exists. Required verification remains mandatory, while redundant checks and
speculative compatibility paths add no presumed value.

## Reconsideration

Revisit if responsibility assessment fails to identify recurring maintenance problems. Detailed
criteria remain in `workflow/guidance/code-quality.md`.
