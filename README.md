# AI Dev Workflow

A lean, adaptive development workflow for OpenCode and Pi. One coordinator guides work from analysis through approved shipping using provider-neutral subagents.

## Workflow

```text
/dev
  → coordinator opens the request, records live .ai/work state, and makes exact Git bookkeeping decisions
  → discuss and approve material decisions
  → define and plan with approval gates
  → after approval, proceed autonomously through high-confidence in-scope implementation, verification, and bounded mechanical corrections
  → delegate implementation, test, and Docker execution
  → verify and run independent review
  → request shipping approval
  → delegate commit and push
```

Role behavior:

- Builder-senior is the trusted-project default-allow command worker for normal implementation, test execution, integration verification, and approved Docker execution. It still keeps hard Git/sudo boundaries and visible direct-client prompts best-effort.
- Builder-junior is mechanical/default-ask and escalates normal reasoning, test, and Docker work when appropriate.
- Reviewer remains evidence-only and read-only.
- Builder-senior may auto-run verb-first `docker compose run`, `docker compose exec`, and `docker compose restart`; global selectors before the verb ask, and `docker compose pull`, `up`, `down`, and resource removal ask.

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
- All isolated Git worktrees must be created under the active project root in ignored `.worktrees/`; never create a worktree outside the project.
- The conversation is not the source of truth. Multi-session work uses one compact living work file.
- Review and shipping remain independent least-privilege subagent gates.

## Permissions

Trusted-project permissions are a curated safe list, not an OS sandbox:

- Repository reads, edits, patch deletions, file listing, globbing, searching, and listed shell inspection commands run without prompts in the relevant roles.
- Curated build/test/lint/typecheck/check commands, Docker build commands, and `webfetch`/`websearch` run without prompts in the relevant roles.
- Direct general network clients and explicit removal commands ask.
- `.env` files, external-directory access, `sudo`, builder Git mutation, force-push, and role boundaries deny.
- Native permissions do not infer GET/POST semantics, and allowed project scripts may have side effects.

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

## Use with Pi

From the repository root, install the pinned source dependency first:

```bash
npm install
```

Install this checkout globally so its role guards also load in persistent feature worktrees:

```bash
pi install /path/to/ai-dev-workflow
pi
```

This project keeps `pi-subagents@0.35.1` pinned exactly. The global package applies only to repositories you trust: Pi native permissions are a curated safe list, not an OS sandbox. Log in with the provider supported by your Pi setup and choose the model there—no provider or model is hardcoded by this workflow.

Pi must run in a trusted repository: its package extensions do not provide a sandbox. They do not infer GET/POST semantics, and allowed project scripts may have side effects. Start the workflow with `/dev <request>`, inspect state with `/workflow-status`, and use `.ai/work/<branch-slug>.md` for multi-session work. For remote work, keep Pi attached to SSH and use `tmux` so the session survives disconnects.

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
- FEATURE: isolated branch and worktree under ignored `.worktrees/`.
- Parallel writers: shared worktree only for explicit disjoint paths without repository-wide side effects.
- Dirty repository with unrelated changes: stop for confirmation or isolate from clean `HEAD`.

## Validation

```bash
python3 scripts/validate.py
```

## Status

Dual-harness package for OpenCode and Pi. Deliberately small: no daemon or hidden state machine.

## License

MIT
