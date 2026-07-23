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
- When isolated Git worktrees are needed, create them under the active project root in ignored `.worktrees/`; never create a worktree outside the project. Runtime `.ai/work/` state still belongs inside the active worktree.
- Trusted-project permissions are a curated convenience policy, not an OS sandbox: repository reads (including `.env`), edits, patch deletions, common project-local shell writes/deletions (`mkdir`, `touch`, `cp`, `mv`, `tee`, `sed`, `rm`, `rmdir`, `unlink`, `find`, and common redirection forms), curated build/test/lint/Docker-build commands, and non-shipper `webfetch`/`websearch` run without prompts in relevant roles. Senior roles are default-allow inside trusted-project boundaries, but visibly invoked direct client commands ask first; junior roles are mechanical and default-ask. Builder-senior may run approved implementation and integration-verification `docker exec`, `docker compose exec`, `docker compose restart`, and `docker compose run`; Docker pull still prompts, and there is no blanket Docker permission. Docker resource removal still prompts; global selectors before verb, visibly invoked direct general network clients and cloud/database CLIs prompt on a best-effort lexical basis. External-directory access is denied where OpenCode detects it, while `sudo`, builder Git mutation, force-push, and role boundaries remain denied; only bare shipper `git push` asks.
- Native permissions do not infer GET/POST semantics. Scripts, interpreters, wrappers, `find -exec`, redirection, and allowed tooling can bypass lexical/direct-path detection and may perform network or filesystem side effects.

## Goal-Driven Execution

- Define observable completion criteria before implementation.
- Tie each non-trivial step to concrete verification.
- For bugs, reproduce the failure, apply the smallest root-cause fix, and add automated regression coverage when the repository already has a suitable test suite.
- For refactors, establish relevant checks before changing behavior-preserving code and rerun them afterward.
- Builders run local task checks. In multi-builder work, a final sequential senior integration-verification task may add approved cross-component tests only in an existing suitable suite and runs the combined verification. It returns compact evidence and does not silently fix or re-scope a failure.
- Baseline checks are encouraged for complex or high-risk work, not mandatory. If a baseline fails, a builder repairs it before continuing and retains the evidence.
- After definition and plan approval, routine high-confidence in-scope work proceeds without progress confirmation and interrupts only for material decisions, conflicts, worker failure, unexpected required-check failure, or mandatory gates. Continue until completion criteria pass or a concrete blocker requires user input.

## Workflow and role boundaries

- `/dev` begins with the coordinator. The orchestrator records live `.ai/work` state, performs exact Git bookkeeping, makes decisions and plans, and delegates implementation, test, and Docker execution.
- After user-approved definition and plan gates, the workflow proceeds autonomously through high-confidence in-scope implementation, verification, and bounded mechanical corrections. It interrupts only for material decisions, scope/security/architecture changes, conflicts, worker failure, unexpected required-check failure, or definition/plan/shipping gates.
- Builder-senior is trusted-project default-allow for command execution. It owns normal implementation, test execution, integration verification, and approved Docker execution, while keeping hard Git/sudo boundaries and visible direct-client prompts best-effort.
- Builder-junior is mechanical/default-ask and escalates normal reasoning, test, and Docker work when appropriate.
- Builder-senior may auto-run verb-first `docker compose run`, `docker compose exec`, and `docker compose restart`; global selectors before the verb (`-p`, `--env-file`, `-f`, `--project-directory`, `--profile`, and `--project-name`) ask, and `docker compose pull`, `up`, `down`, and resource removal ask.
- Reviewer remains evidence-only and read-only.

## Verification

- Every change requires evidence proportionate to its behavior and risk.
- Treat repository-defined checks and CI requirements as authoritative.
- Choose the strongest practical verification: integration or end-to-end tests, focused tests, build/type/lint/schema checks, dry runs, plans, smoke tests, or concrete manual verification.
- Add or change automated tests only when the repository already has a suitable test suite. Never introduce a test framework or harness solely to validate the change.
- For bug fixes without a suitable test suite, document the limitation, strongest existing alternative verification, and residual risk.
- Report only checks actually performed and distinguish automated results from inspection or manual verification.
- Reviewer stays read-only and evidence-based and does not execute tests or Docker.
- Do not ship when required checks fail or no credible verification is possible.
- After configuration changes, rerun the installer and restart OpenCode. Configuration changes require an OpenCode restart to take effect.

## Instruction Priority

- Project-local instructions override this global policy.
- If repository conventions conflict or no precedent exists, choose the simplest idiomatic approach. Ask only when the choice materially affects behavior or architecture.
