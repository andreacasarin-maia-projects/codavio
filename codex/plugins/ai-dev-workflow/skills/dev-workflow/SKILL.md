---
name: dev-workflow
description: Run an approval-gated, role-based software development workflow from repository analysis through optional Git shipping. Use only when the user explicitly invokes $dev-workflow for a change, bug fix, feature, refactor, or other repository implementation request; never invoke implicitly.
---

# AI development workflow

Coordinate the work as the primary agent. Do not implement, independently review,
commit, or push directly. Delegate those responsibilities to bounded subagents using
the role briefs in [roles.md](references/roles.md).

## Non-negotiable boundaries

- Read the applicable `AGENTS.md`, current branch, status, diff, and active
  `.ai/work/<branch-slug>.md` before routing.
- Treat the user as the owner of material architecture, API, schema, security,
  infrastructure, migration, destructive, and shipping decisions.
- Require explicit approval for material definitions, plans when required, corrections
  that change an approved material boundary, and shipping. Silence is never approval.
- An explicit, unambiguous `QUICK` request itself approves its compact definition when
  no material alternative remains, the working tree is clean or non-overlapping, and
  verification is obvious. State the interpreted definition before proceeding.
- After definition and plan approval, continue autonomously through high-confidence,
  in-scope work. Interrupt only for a mandatory gate, material decision, conflict,
  worker failure, or unexpected required-check failure.
- Keep feature/risky worktrees inside `<project-root>/.worktrees/`.
- Create `.ai/work/<branch-slug>.md` only for planned or multi-session work. Keep it
  compact and rewrite current state rather than appending a transcript.
- Preserve unrelated user changes. Stop or isolate when dirty changes overlap.
- Never deploy production.

## Model and delegation contract

Use the collaboration tools exposed by Codex. Do not create user-owned threads for
workflow roles.

- Spawn `analyst` and `reviewer` with model `gpt-5.6-sol`.
- Spawn `explorer`, `builder-junior`, `builder-senior`, and `shipper` with model
  `gpt-5.6-terra`.
- Give each subagent one concrete, bounded task and the matching role brief.
- When setting a model override, use `fork_turns: "none"` or a bounded positive turn
  count and include all necessary repository/request context.
- Do not allow nested delegation. Tell every role not to spawn subagents.
- Parallelize only independent read-only investigations or approved disjoint writes.
- The orchestrator owns approvals, `.ai/work` state, combined diff inspection, and
  exact Git bookkeeping.

If collaboration tools are unavailable, stop and explain that this workflow requires
Codex subagents; do not collapse the roles into one agent.

## Route the request

Classify the work:

- `QUICK`: obvious, localized, low-risk, and no material new behavior or decision.
- `BUGFIX`: bounded broken behavior with an expected result that can be established.
- `FEATURE`: new behavior, ambiguity, multiple components, migration/API/security/
  infrastructure impact, or work benefiting from decomposition.

Use explorers for focused repository questions. Use the analyst adaptively: usually
skip for QUICK; use when BUGFIX behavior/root cause is unclear; use by default for
FEATURE; always use for material architecture, public API, schema, security,
infrastructure, migration, destructive behavior, or hard escalation.

Present a compact definition containing route, goal, scope, non-goals, material
alternatives, risks, verification, and whether a plan/worktree is required. Ask the
user to approve or override it before implementation, except for an unambiguous
`QUICK` request that meets the implicit-definition conditions above.

## Plan and implement

After definition approval:

- QUICK: delegate directly to the appropriate builder. Use junior only for explicit
  mechanical work; otherwise use senior.
- BUGFIX: delegate reproduction and the smallest root-cause fix to senior. Add
  regression coverage only in an existing suitable suite.
- FEATURE: record the approved definition, create a concrete implementation plan,
  have the analyst challenge material decisions, then ask for explicit plan approval.

Each planned task must state outcome, likely paths/symbols, invariants, non-goals,
dependencies, completion criterion, strongest practical verification, builder class,
and exclusive ownership/parallel group when applicable.

Capture a Git baseline before writes. Delegate each approved task with exact scope.
Builders own implementation and executable verification. After each task/group,
inspect status and combined diff. For multi-builder work, delegate a final sequential
senior integration-verification pass.

## Review, correct, and ship

After successful verification, spawn a fresh reviewer against the approved definition,
complete candidate diff, and actual verification evidence. The reviewer remains
read-only and does not run tests.

If blockers exist, autonomously delegate corrections that remain inside the approved
behavior, scope, architecture, dependencies, migrations, acceptance criteria, and risk.
Reverify and review again. Present the finding and request explicit approval before any
correction that changes one of those material boundaries. Do not silently re-scope work.

After a clean review, confirm the final branch/status/diff and present the exact commit
message, branch, remote, and files. Require explicit shipping approval. Only then
delegate the Git-only shipper. The shipper stages approved files, creates one focused
commit, and pushes the approved branch without force.

End with the implemented outcome, verification evidence, review result, shipping
state, and residual risk. Do not imply that unrun checks passed.
