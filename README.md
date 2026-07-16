# AI Dev Workflow

A lean, adaptive development workflow for OpenCode. One entry point classifies work as a quick change, bug fix, or planned feature, then routes it to model-specific agents.

## Workflow

```text
/define
  ├─ QUICK   → worker → verify → /review → /ship
  ├─ BUGFIX  → reproduce → regression test → fix → /review → /ship
  └─ FEATURE → /plan → /build → /review → /ship
```

Model routing:

| Role | Model |
|---|---|
| Analysis and hard escalation | `openai/gpt-5.6-sol` |
| Planning and review | `openai/gpt-5.6-terra` |
| Normal implementation and shipping | `openai/gpt-5.6-luna` |
| Mechanical tasks | `openai/gpt-5.4-mini` |

## Principles

- Progressive ceremony: small changes stay small.
- Integration/E2E tests by default; unit tests only for unusually complex isolated logic.
- Every bug fix adds an automated regression test at the most useful level.
- Worktrees for features, risky work, dirty repositories, or parallel writers—not for every typo.
- The conversation is not the source of truth. Multi-session work uses one compact living work file.
- Review and ship are separate gates. Ship never performs opportunistic refactors.

## Install into a project

```bash
git clone https://github.com/andreacasarin-maia-projects/ai-dev-workflow.git
cd ai-dev-workflow
./scripts/install.sh /path/to/your/project
```

The installer copies `.opencode/`, creates `.ai/work/`, and adds a small workflow section to `AGENTS.md`. Existing workflow files are not overwritten unless `--force` is supplied.

Then run OpenCode inside the target project:

```text
/define <request>
```

## Commands

| Command | Purpose |
|---|---|
| `/define` | Brainstorm, identify trade-offs, classify the route, and ask for approval |
| `/plan` | Turn an approved feature definition into bounded tasks |
| `/build` | Delegate pending tasks to cheap workers and keep active state compact |
| `/review` | Read-only implementation and risk review |
| `/ship` | Verify preconditions, commit, and push |

## Persistent context

Only multi-session or planned work needs a file:

```text
.ai/work/<branch-slug>.md
```

It contains the approved definition, task checklist, current state, verification, and open review findings. It is rewritten and compacted, never used as an append-only transcript.

Quick changes usually need no work file. A bug fix only gets one if it becomes multi-session or expands beyond a bounded fix. Git, the regression test, and the PR remain the durable history.

## Worktrees

- QUICK: current branch if clean and low risk.
- BUGFIX: current branch if clean and bounded.
- FEATURE: isolated branch and worktree.
- Parallel writers: one worktree per worker.
- Dirty repository with unrelated changes: stop for confirmation or isolate from clean `HEAD`.

## Validation

```bash
python3 scripts/validate.py
```

## Status

Initial OpenCode implementation. Deliberately small: no plugin, daemon, hidden state machine, or cross-harness installer yet.

## License

MIT
