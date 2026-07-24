# AI Dev Workflow

A lean, adaptive development workflow for OpenCode, Pi, and Codex. One coordinator guides work from analysis through approved shipping using role-specific subagents.

Repository tooling and installation require Node.js 22.6 or newer.

## Workflow

```text
/dev
  → coordinator opens the request, records live .ai/work state, and makes exact Git bookkeeping decisions
  → analyst sharpens the problem and explores orthogonal solution families when needed
  → discuss and approve the problem definition and solution direction
  → planner turns the approved direction into software architecture and implementation slices
  → approve the architecture plan when required
  → treat an explicit unambiguous QUICK request as its definition approval
  → proceed autonomously through high-confidence in-scope implementation, verification, and corrections within approved material boundaries
  → delegate implementation, test, and Docker execution
  → verify and run independent review
  → request shipping approval
  → delegate commit and push
```

Role behavior:

- Analyst separates symptoms from the underlying problem, makes assumptions and unknowns explicit, and compares materially different solution families against decision criteria.
- Planner converts the approved direction into component boundaries, interfaces, data and control flow, failure semantics, migration strategy, implementation slices, ownership, and architecture-level verification.
- Builder-senior is the trusted-project default-allow command worker for normal implementation, test execution, integration verification, and approved Docker execution. It still keeps hard Git/sudo boundaries and visible direct-client prompts best-effort.
- Builder-junior is mechanical/default-ask and escalates normal reasoning, test, and Docker work when appropriate.
- Reviewer remains evidence-only and read-only.
- Builder-senior may auto-run verb-first `docker compose run`, `docker compose exec`, and `docker compose restart`; global selectors before the verb (`-p`, `--env-file`, `-f`, `--project-directory`, `--profile`, and `--project-name`) ask, and `docker compose pull`, `up`, `down`, and resource removal ask.

Model routing:

| Role | Model |
|---|---|
| Orchestration and review | `openai/gpt-5.6-terra` |
| Problem framing, architecture planning, and hard analysis | `openai/gpt-5.6-sol` |
| Senior implementation | `openai/gpt-5.6-luna` |
| Exploration, junior implementation, and shipping | `openai/gpt-5.4-mini` |

## Principles

- Progressive ceremony: small changes stay small.
- An explicit, unambiguous QUICK request can serve as definition approval when no material alternative remains, the working tree is clean or non-overlapping, and verification is obvious.
- The user owns material architecture, API, schema, security, infrastructure, migration, and destructive decisions.
- After definition and plan approval, routine high-confidence in-scope work proceeds without progress confirmation and interrupts only for material decisions, conflicts, worker failure, unexpected required-check failure, or mandatory gates.
- Every change gets verification proportionate to its behavior and risk.
- Builders execute implementation, tests, and Docker. In multi-builder work, a final sequential senior integration-verification pass may add approved cross-component tests only within an existing suitable suite and runs the combined verification. It returns compact evidence and does not silently fix or re-scope failures.
- Baseline checks are encouraged for complex or high-risk work, not mandatory. If a baseline fails, a builder repairs it before continuing and retains the evidence.
- Bug fixes add regression coverage only within an existing suitable test suite; otherwise they use and document the strongest existing verification.
- Worktrees isolate features, risky work, or unrelated dirty changes; parallel writers require explicit disjoint ownership.
- All isolated Git worktrees must be created under the active project root in ignored `.worktrees/`; never create a worktree outside the project.
- The conversation is not the source of truth. Multi-session work uses one compact living work file.
- Orchestrator is coordination-only: it owns approvals, `.ai/work` state, exact Git bookkeeping, combined-diff inspection, and execution delegation; analyst owns problem framing and planner owns architecture.
- Reviewer stays read-only and evidence-based; it does not execute tests or Docker. Shipping remains an independent least-privilege subagent gate.
- Review corrections proceed autonomously when they stay inside approved behavior, scope, architecture, dependencies, migrations, acceptance criteria, and risk; changing one of those boundaries requires approval.

## Permissions

Trusted-project permissions are a curated safe list, not an OS sandbox:

- Repository reads (including `.env` files), edits, patch deletions, file listing, globbing, searching, and common project-local shell writes/deletions (`mkdir`, `touch`, `cp`, `mv`, `tee`, `sed`, `rm`, `rmdir`, `unlink`, `find`, and common redirection forms) run without prompts in the relevant roles.
- Curated build/test/lint/typecheck/check commands, Docker build commands, and non-shipper `webfetch`/`websearch` run without prompts in the relevant roles.
- Builder-senior may run approved implementation and integration-verification `docker exec`, `docker compose exec`, `docker compose restart`, and `docker compose run`; Docker pull still prompts, and there is no blanket Docker permission.
- Docker resource removal still prompts. Global selectors before verb, including `--project-name`, visibly invoked direct general network clients, and cloud/database CLIs prompt on a best-effort lexical basis.
- External-directory access is denied where OpenCode detects it; `sudo`, builder Git mutation, force-push, and role boundaries remain denied. Bare shipper `git push` is the only push that asks.
- Senior is trusted-project default-allow, but visibly invoked direct client commands ask first; global selectors before verb, including `--project-name`, Docker pull/up/down, and resource removals ask. Junior is mechanical and default-ask.
- This is trusted-project convenience policy, not a sandbox: the write/deletion and network rules are best-effort lexical policy. Scripts, interpreters, wrappers, `find -exec`, redirection, and allowed tooling can bypass lexical/direct-path detection and may perform network or filesystem side effects. Native permissions do not infer GET/POST semantics.
- These OpenCode permissions are intentionally not a parity claim for Pi. Pi uses `@gotgenes/pi-permission-system` to auto-approve its explicit low-risk command set, forward `ask` decisions from subagents to the parent UI, and deny hard role boundaries.

## Install globally

```bash
git clone https://github.com/andreacasarin-maia-projects/ai-dev-workflow.git
cd ai-dev-workflow
node scripts/install.mjs opencode
```

The installer symlinks this repository's agents, commands, and minimal global behavioral baseline into `${XDG_CONFIG_HOME:-$HOME/.config}/opencode`. After adding or renaming commands, rerun the installer and then restart OpenCode to reload them. Configuration changes require an OpenCode restart.

Unrelated existing files are preserved. Obsolete workflow-owned symlinks are removed automatically. `node scripts/install.mjs opencode --force` moves other conflicts to a sibling `.backup` path before linking.

Run OpenCode inside any Git project:

```text
/dev <request>
```

## Use with Pi

From the repository root, install the pinned source dependency, required permission
extension, and this workflow:

```bash
node scripts/install.mjs pi
pi
```

The installer runs `npm install`, installs `@gotgenes/pi-permission-system`, installs
this checkout globally so its role guards load in persistent feature worktrees, and
verifies that Pi lists both packages. Override the executables with `NPM_BIN` or
`PI_BIN` when needed.

This project keeps `pi-subagents@0.35.1` pinned exactly. The permission extension is required for runtime `allow`/`ask`/`deny` enforcement; run `/subagents-doctor` after installation to confirm that child-agent approval forwarding is active. The global package applies only to repositories you trust: Pi permissions are a curated safe list, not an OS sandbox. Log in with the provider supported by your Pi setup and choose the model there—no provider or model is hardcoded by this workflow.

Pi must run in a trusted repository: its package extensions do not provide a sandbox. They do not infer GET/POST semantics, and allowed project scripts may have side effects. Start the workflow with `/dev <request>`, inspect state with `/workflow-status`, and use `.ai/work/<branch-slug>.md` for multi-session work. For remote work, keep Pi attached to SSH and use `tmux` so the session survives disconnects.

## Install in Codex

Install the tracked local marketplace, plugin, and minimal global behavioral baseline:

```bash
node scripts/install.mjs codex
```

The installer registers the marketplace under `codex/`, installs the
`ai-dev-workflow` plugin, and links `templates/AGENTS.global.md` to
`${CODEX_HOME:-$HOME/.codex}/AGENTS.md`. Existing global guidance aborts installation;
use `node scripts/install.mjs codex --force` to move it to `AGENTS.md.backup` first. An
existing backup is never overwritten.

Start a new Codex task after installation and invoke the workflow explicitly:

```text
$dev-workflow <request>
```

Implicit invocation is disabled. Codex maps analyst, planner, and reviewer to `gpt-5.6-sol`;
explorer, builders, and shipper use `gpt-5.6-terra`. The same material-definition,
FEATURE-plan, material-correction, and shipping approval rules apply.

## Entry points

| Harness | Entry point | Purpose |
|---|---|---|
| OpenCode | `/dev` | Orchestrate analysis through approved shipping |
| Pi | `/dev` | Orchestrate analysis through approved shipping |
| Codex | `$dev-workflow` | Explicitly run the Codex plugin workflow |

Install every supported harness after their CLIs are available:

```bash
node scripts/install.mjs all
```

The unified Node installer checks generated-adapter freshness and all required
executables before changing any harness. It is the only installer; each target uses
its native installation mechanism behind the same interface.

## Canonical workflow sources

Shared workflow behavior lives under `workflow/`:

- `workflow/orchestrator.md` defines routing, approvals, planning, implementation,
  verification, review, correction, and shipping behavior.
- `workflow/roles/*.md` defines the seven reusable role contracts.
- `workflow/guidance/*.md` contains focused implementation and verification guidance
  composed only into the roles that need it.
- `workflow/manifest.json` declares the command, roles, and supported harnesses.

`scripts/generate.mjs` combines those canonical sources with the native frontmatter
already present in each harness adapter. This keeps OpenCode models and permissions,
Pi tools and permission policies, and Codex skill metadata in their native formats
without duplicating behavioral prompts.

`templates/AGENTS.global.md` intentionally contains only universal behavioral
guidelines: think before coding, prefer simplicity, make surgical changes, and work
toward verifiable goals. Workflow routing, architecture, permissions, implementation
quality, and verification policy stay in canonical coordinator, role, guidance, or
harness-specific files rather than leaking into every global session.

Generated adapters are tracked so installations do not require generation. After
editing canonical sources or adapter frontmatter, regenerate and check them:

```bash
npm run generate
npm run generate:check
```

The generator uses only Node built-ins. A general template engine is not needed
because the adapters require composition and small harness-specific wrappers, not
arbitrary presentation logic.

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
npm run validate
```

Validation includes a generation drift check and fails when tracked harness adapters
do not match the canonical workflow sources.

## Status

Three-harness package for OpenCode, Pi, and Codex. Deliberately small: no daemon or hidden state machine.

## License

MIT
