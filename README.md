# AI Dev Workflow

A lean, adaptive development workflow for OpenCode. One orchestrator guides work from analysis through approved shipping using model-specific subagents.

## Workflow

```text
/dev
  → explore and consult analyst when needed
  → discuss and approve material decisions
  → define and plan with approval gates
  → delegate parallel-safe implementation
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
- Every change gets verification proportionate to its behavior and risk.
- Bug fixes add regression coverage only within an existing suitable test suite; otherwise they use and document the strongest existing verification.
- Worktrees isolate features, risky work, or unrelated dirty changes; parallel writers require explicit disjoint ownership.
- The conversation is not the source of truth. Multi-session work uses one compact living work file.
- Review and shipping remain independent least-privilege subagent gates.

## Install globally

```bash
git clone https://github.com/andreacasarin-maia-projects/ai-dev-workflow.git
cd ai-dev-workflow
./scripts/install.sh
```

The installer symlinks this repository's agents, commands, and engineering policy into `${XDG_CONFIG_HOME:-$HOME/.config}/opencode`. After adding or renaming commands, rerun the installer and then restart OpenCode to reload them.

Unrelated existing files are preserved. Obsolete workflow-owned symlinks are removed automatically. `./scripts/install.sh --force` moves other conflicts to a sibling `.backup` path before linking.

Run OpenCode inside any Git project:

```text
/dev <request>
```

## Commands

| Command | Purpose |
|---|---|
| `/dev` | Orchestrate analysis, decisions, planning, implementation, review, and approved shipping |

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
- FEATURE: isolated branch and worktree.
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
