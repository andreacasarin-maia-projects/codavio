# Engineering Policy

## Think Before Coding

- Inspect relevant repository sources before asking questions.
- State material assumptions, ambiguities, and trade-offs. Never choose silently when alternatives change behavior or scope.
- Prefer simpler approaches and push back on unnecessary complexity.
- Ask only when important uncertainty remains after investigation.

## Simplicity

- Implement the smallest correct solution within approved scope.
- Add no speculative features, abstractions, configurability, compatibility layers, or dependencies.
- Keep single-use logic local unless extraction materially improves clarity.
- Do not defend against scenarios excluded by verified invariants.
- Simplify implementations that are larger or more indirect than the problem requires.

## Implementation Quality

- Prefer built-in platform capabilities, official tools, and existing repository utilities over bespoke implementations.
- Write code that communicates intent through clear naming, direct control flow, cohesive responsibilities, and minimal hidden state, following the language and repository conventions.
- Optimize for solutions that are easy to understand, operate, maintain, and verify rather than enforcing arbitrary structural limits.
- Treat duplication, excessive coupling, deep nesting, unclear ownership, and difficult testing as signals to investigate, not automatic reasons to refactor.
- Refactor within the approved change boundary when it directly simplifies the implementation or reduces its risk. Propose broader refactoring separately with evidence, expected benefit, scope, risk, and verification.
- Keep refactors behavior-preserving unless behavior changes are explicitly approved, and verify relevant behavior before and after.
- Declare dependencies through the repository's established dependency mechanism, and never place credentials or secrets in source code.

## Surgical Changes

- Touch only files and lines required by the request or its verification.
- Match existing architecture, conventions, and style. Inspect an analogous implementation before introducing a new pattern.
- Treat repository formatters, linters, type rules, and project instructions as authoritative.
- Do not refactor, reformat, modernize, or remove unrelated code.
- Remove imports, variables, functions, and files made obsolete by the current change.
- Preserve unrelated user or agent changes. Mention pre-existing issues instead of fixing them.

## Goal-Driven Execution

- Define observable completion criteria before implementation.
- Tie each non-trivial step to concrete verification.
- For bugs, reproduce the failure, apply the smallest root-cause fix, and add automated regression coverage when the repository already has a suitable test suite.
- For refactors, establish relevant checks before changing behavior-preserving code and rerun them afterward.
- Continue until completion criteria pass or a concrete blocker requires user input.

## Verification

- Every change requires evidence proportionate to its behavior and risk.
- Treat repository-defined checks and CI requirements as authoritative.
- Choose the strongest practical verification: integration or end-to-end tests, focused tests, build/type/lint/schema checks, dry runs, plans, smoke tests, or concrete manual verification.
- Add or change automated tests only when the repository already has a suitable test suite. Never introduce a test framework or harness solely to validate the change.
- For bug fixes without a suitable test suite, document the limitation, strongest existing alternative verification, and residual risk.
- Report only checks actually performed and distinguish automated results from inspection or manual verification.
- Do not ship when required checks fail or no credible verification is possible.

## Instruction Priority

- Project-local instructions override this global policy.
- If repository conventions conflict or no precedent exists, choose the simplest idiomatic approach. Ask only when the choice materially affects behavior or architecture.
