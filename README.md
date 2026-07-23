# AI Dev Workflow

A lean, adaptive development workflow for OpenCode. One orchestrator guides work from analysis through approved shipping using model-specific subagents.

## Workflow

```text
/dev
  → orchestrator coordinates analysis, decisions, plans, delegation, and exact Git bookkeeping
  → explore and consult analyst when needed
  → discuss and approve material decisions
  → define and plan with approval gates
  → delegate implementation, tests, and Docker to builders
  → verify and run independent review
  → request shipping approval
  → delegate commit and push
```

Model routing:

| Role | Model |
|---|---|
| Orchestration and review | `openai/gpt-5.6-terra` |
| Architecture and hard analysis | `openai/gpt-5.6-sol` |
| Senior implementation | `openai/gpt-5.6-luna` |
| Exploration, junior implementation, and shipping | `openai/gpt-5.4-mini` |

## Principles

- Progressive ceremony: small changes stay small.
- The user owns material architecture, API, schema, security, infrastructure, migration, and destructive decisions.
- After definition and plan approval, routine high-confidence in-scope work proceeds without progress confirmation and interrupts only for material decisions, conflicts, worker failure, unexpected required-check failure, or mandatory gates.
- Every change gets verification proportionate to its behavior and risk.
- Builders execute implementation, tests, and Docker. In multi-builder work, a final sequential senior integration-verification pass may add approved cross-component tests only within an existing suitable suite and runs the combined verification. It returns compact evidence and does not silently fix or re-scope failures.
- Baseline checks are encouraged for complex or high-risk work, not mandatory. If a baseline fails, a builder repairs it before continuing and retains the evidence.
- Bug fixes add regression coverage only within an existing suitable test suite; otherwise they use and document the strongest existing verification.
- Worktrees isolate features, risky work, or unrelated dirty changes; parallel writers require explicit disjoint ownership.
- The conversation is not the source of truth. Multi-session work uses one compact living work file.
- Orchestrator is coordination-only: it owns `.ai/work` state, exact Git bookkeeping, decisions, plans, and delegation.
- Reviewer stays read-only and evidence-based; it does not execute tests or Docker. Shipping remains an independent least-privilege subagent gate.

## Permissions

Trusted-project permissions are a curated safe list, not an OS sandbox:

- Repository reads (including `.env` files), edits, patch deletions, file listing, globbing, searching, and common project-local shell writes/deletions (`mkdir`, `touch`, `cp`, `mv`, `tee`, `sed`, `rm`, `rmdir`, `unlink`, `find`, and common redirection forms) run without prompts in the relevant roles.
- Curated build/test/lint/typecheck/check commands, Docker build commands, and non-shipper `webfetch`/`websearch` run without prompts in the relevant roles.
- Builder-senior may run approved implementation and integration-verification `docker exec`, `docker compose exec`, `docker compose restart`, and `docker compose run`; Docker pull still prompts, and there is no blanket Docker permission.
- Docker resource removal still prompts. Global selectors before verb, visibly invoked direct general network clients, and cloud/database CLIs prompt on a best-effort lexical basis.
- External-directory access is denied where OpenCode detects it; `sudo`, builder Git mutation, force-push, and role boundaries remain denied. Bare shipper `git push` is the only push that asks.
- Senior is trusted-project default-allow, but visibly invoked direct client commands ask first; global selectors before verb, Docker pull/up/down, and resource removals ask. Junior is mechanical and default-ask.
- This is trusted-project convenience policy, not a sandbox: the write/deletion and network rules are best-effort lexical policy. Scripts, interpreters, wrappers, `find -exec`, redirection, and allowed tooling can bypass lexical/direct-path detection and may perform network or filesystem side effects. Native permissions do not infer GET/POST semantics.

## Install globally

```bash
git clone https://github.com/andreacasarin-maia-projects/ai-dev-workflow.git
cd ai-dev-workflow
./scripts/install.sh
```

The installer symlinks this repository's agents, commands, and engineering policy into `${XDG_CONFIG_HOME:-$HOME/.config}/opencode`. After adding or renaming commands, rerun the installer and then restart OpenCode to reload them. Configuration changes require an OpenCode restart.

Unrelated existing files are preserved. Obsolete workflow-owned symlinks are removed automatically. `./scripts/install.sh --force` moves other conflicts to a sibling `.backup` path before linking.

Run OpenCode inside any Git project:

```text
/dev <request>
```

## Commands

| Command | Purpose |
|---|---|
| `/dev` | Orchestrate coordination, analysis, decisions, planning, delegation, review, and approved shipping |

## Persistent context

Only multi-session or planned work needs a file:

```text
.ai/work/<branch-slug>.md
```

It contains the approved definition, task checklist, current state, verification, and open review findings. It is rewritten and compacted, never used as an append-only transcript.

The workflow creates `.ai/work/` on demand under the active Git worktree. Global installation never creates runtime project state.

Quick changes usually need no work file. A bug fix only gets one if it becomes multi-session or expands beyond a bounded fix. Git, verification evidence, and the PR remain the durable history.

## Worktrees

- QUICK: current branch if clean and low risk.
- BUGFIX: current branch if clean and bounded.
- FEATURE: isolated branch and worktree under ignored `.worktrees/`.
- Parallel writers: shared worktree only for explicit disjoint paths without repository-wide side effects.
- Dirty repository with unrelated changes: stop for confirmation or isolate from clean `HEAD`.

## Validation

```bash
python3 scripts/validate.py
```

## Status

Initial OpenCode implementation. Deliberately small: no plugin, daemon, or hidden state machine.

## License

MIT
