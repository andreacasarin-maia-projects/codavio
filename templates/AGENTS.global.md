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
- For bugs, reproduce the failure, add failing regression coverage, apply the smallest root-cause fix, then run relevant broader checks.
- For refactors, establish relevant checks before changing behavior-preserving code and rerun them afterward.
- Continue until completion criteria pass or a concrete blocker requires user input.

## Instruction Priority

- Project-local instructions override this global policy.
- If repository conventions conflict or no precedent exists, choose the simplest idiomatic approach. Ask only when the choice materially affects behavior or architecture.
