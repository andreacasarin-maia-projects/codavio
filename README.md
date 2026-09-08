# AI Dev Workflow

A lean, adaptive development workflow for OpenCode, Pi, and Codex. One coordinator guides work from analysis through approved shipping using role-specific subagents.

Repository tooling and installation require Node.js 22.6 or newer.

## Workflow

```text
/dev
  → coordinator visibly declares QUICK, BUGFIX, or FEATURE before task work
  → BUGFIX and FEATURE invoke an explorer first
  → every FEATURE then invokes an analyst to sharpen the problem and explore orthogonal solution families
  → discuss and approve the problem definition and solution direction
  → FEATURE invokes a planner to turn the approved direction into software architecture and implementation slices
  → approve the architecture plan when required
  → treat an explicit unambiguous QUICK request as its definition approval
  → delegate every implementation, test, and Docker action to a builder
  → compact durable architectural and philosophical context into MEMORY.md
  → invoke an independent reviewer after successful verification
  → request shipping approval
  → delegate commit and push
```

Role behavior:

- Analyst separates symptoms from the underlying problem, makes assumptions and unknowns explicit, and compares materially different solution families against decision criteria.
- Planner converts the approved direction into component boundaries, interfaces, data and control flow, failure semantics, migration strategy, implementation slices, ownership, and architecture-level verification.
- Builder is the implementation worker for mechanical edits, normal development,
  test execution, integration verification, and approved Docker execution. Multiple
  builder instances may run concurrently only with disjoint ownership.
- Reviewer remains evidence-only and read-only.
- Builder may auto-run verb-first `docker compose run`, `docker compose exec`, and `docker compose restart`; global selectors before the verb (`-p`, `--env-file`, `-f`, `--project-directory`, `--profile`, and `--project-name`) ask, and `docker compose pull`, `up`, `down`, and resource removal ask.

OpenCode model routing:

| Role | Model |
|---|---|
| Orchestration and review | `openai/gpt-5.6-terra` |
| Problem framing and hard analysis | `openai/gpt-6-astra` |
| Architecture planning | `openai/gpt-5.6-sol` |
| Implementation | `openai/gpt-5.6-luna` |
| Exploration and implementation | `openai/gpt-5.6-luna` |
| Shipping | `openai/gpt-5.4-mini` |

## Principles

- Progressive ceremony: small changes stay small.
- Routing is observable and ordered: the coordinator declares QUICK, BUGFIX, or FEATURE
  before task work; BUGFIX and FEATURE start with an explorer, and FEATURE always continues
  through an analyst before definition approval.
- An explicit, unambiguous QUICK request can serve as definition approval when no material alternative remains, the working tree is clean or non-overlapping, and verification is obvious.
- The user owns material architecture, API, schema, security, infrastructure, migration, and destructive decisions.
- After definition and plan approval, routine high-confidence in-scope work proceeds without progress confirmation and interrupts only for material decisions, conflicts, worker failure, unexpected required-check failure, or mandatory gates.
- Every change gets verification proportionate to its behavior and risk.
- Builders execute every implementation, test, and Docker action; the coordinator never substitutes for them. In multi-builder work, a final sequential integration-verification pass may add approved cross-component tests only within an existing suitable suite and runs the combined verification. It returns compact evidence and does not silently fix or re-scope failures.
- Baseline checks are encouraged for complex or high-risk work, not mandatory. If a baseline fails, a builder repairs it before continuing and retains the evidence.
- Bug fixes add regression coverage only within an existing suitable test suite; otherwise they use and document the strongest existing verification.
- Worktrees isolate features, risky work, or unrelated dirty changes; parallel writers require explicit disjoint ownership.
- Explorer and builder roles are reusable capability profiles rather than singletons:
  independent explorer lanes may run concurrently, and multiple builders may run
  concurrently when their write scopes and side effects are disjoint.
- All isolated Git worktrees must be created under the active project root in ignored `.worktrees/`; never create a worktree outside the project.
- The conversation is not the source of truth. Multi-session work uses one compact living work file.
- Root `MEMORY.md` is dense, living repository context rather than history. Every role reads it after the applicable `AGENTS.md`, which remains authoritative, and the coordinator rewrites it before final review when shipped work makes durable context new, stale, or redundant.
- Orchestrator is coordination-only: it owns approvals, `.ai/work` state, branch and worktree bookkeeping, and execution delegation; it does not read diff content. Analyst owns problem framing, planner owns the detailed implementation plan, and the reviewer owns authoritative diff inspection.
- Reviewer stays read-only and evidence-based; it does not execute tests or Docker. Shipping remains an independent least-privilege subagent gate.
- Review corrections proceed autonomously when they stay inside approved behavior, scope, architecture, dependencies, migrations, acceptance criteria, and risk; changing one of those boundaries requires approval.

## Permissions

Trusted-project permissions are a curated safe list, not an OS sandbox:

- Repository reads (including `.env` files), edits, patch deletions, file listing, globbing, searching, and common project-local shell writes/deletions (`mkdir`, `touch`, `cp`, `mv`, `tee`, `sed`, `rm`, `rmdir`, `unlink`, `find`, and common redirection forms) run without prompts in the relevant roles.
- Curated build/test/lint/typecheck/check commands and Docker build commands run without prompts in the relevant roles. Web access — OpenCode `webfetch`/`websearch` and Pi `web_search`/`fetch_content`/`get_search_content` — is allowed only for the research roles (analyst and planner) and denied for every other role.
- Builder may run approved implementation and integration-verification `docker exec`, `docker compose exec`, `docker compose restart`, and `docker compose run`; Docker pull still prompts, and there is no blanket Docker permission.
- External-directory access is denied where OpenCode detects it; `sudo`, all builder Git access (builders never run Git; the reviewer and shipper own diff inspection), the Pi coordinator session's `git diff`/`git log`, force-push, and role boundaries remain denied. Bare shipper `git push` is the only push that asks.
- The builder is default-`ask`, scoped to file edits and a curated verification allowlist
  (test/lint/typecheck/build/check across ecosystems, plus read-only and
  integration-verification Docker). Anything outside that list prompts: general network
  clients, cloud/database CLIs, Docker pull/up/down, and resource removal. `git` and
  `sudo` are denied outright.
- This is trusted-project convenience policy, not a sandbox: the write/deletion and network rules are best-effort lexical policy. Scripts, interpreters, wrappers, `find -exec`, redirection, and allowed tooling can bypass lexical/direct-path detection and may perform network or filesystem side effects. Native permissions do not infer GET/POST semantics.
- These OpenCode permissions are intentionally not a parity claim for Pi. Pi uses `@gotgenes/pi-permission-system` to auto-approve its explicit low-risk command set, forward `ask` decisions from subagents to the parent UI, and deny hard role boundaries.

## Install globally

```bash
git clone https://github.com/andreacasarin-maia-projects/ai-dev-workflow.git
cd ai-dev-workflow
node scripts/install.mjs opencode
```

The installer first generates ignored `build/opencode` artifacts, then symlinks its agents, command, and minimal global behavioral baseline into `${XDG_CONFIG_HOME:-$HOME/.config}/opencode`. After adding or renaming commands, rerun the installer and then restart OpenCode to reload them. Configuration changes require an OpenCode restart.

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

The installer generates `build/pi`, runs `npm install` in that package root, installs
`@gotgenes/pi-permission-system`, and installs that generated package so its role guards
load in persistent feature worktrees. Override the executables with `NPM_BIN` or
`PI_BIN` when needed.

This project keeps `pi-subagents@0.35.1` pinned exactly. The permission extension is
required for runtime `allow`/`ask`/`deny` enforcement; run `/subagents-doctor` after
installation to confirm that child-agent approval forwarding is active. The analyst and
planner use Pi's `web_search`, `fetch_content`, and `get_search_content` tools for
documentation lookup and search; the installer adds the
[`pi-web-access`](https://github.com/nicobailon/pi-web-access) extension
(`pi install npm:pi-web-access`) automatically so those tools work. A coordinator guard
blocks the main Pi session's `git diff`/`git log` so diff inspection stays with the
reviewer. The global
package applies only to repositories you trust: Pi permissions are a curated safe list,
not an OS sandbox. Log in to OpenAI in Pi and choose the main coordinator model there.
Each delegated role pins the same model shown in the OpenCode routing table; use
`/subagents-models` after restarting Pi to inspect the live mapping.

Pi must run in a trusted repository: its package extensions do not provide a sandbox. They do not infer GET/POST semantics, and allowed project scripts may have side effects. Start the workflow with `/dev <request>`, inspect state with `/workflow-status`, and use `.ai/work/<branch-slug>.md` for multi-session work. For remote work, keep Pi attached to SSH and use `tmux` so the session survives disconnects.

## Install in Codex

Install the generated local marketplace, plugin, and minimal global behavioral baseline:

```bash
node scripts/install.mjs codex
```

The installer generates and registers the marketplace under `build/codex/`, installs the
`ai-dev-workflow` plugin, and links its generated global guidance to
`${CODEX_HOME:-$HOME/.codex}/AGENTS.md`. Existing global guidance aborts installation;
use `node scripts/install.mjs codex --force` to move it to `AGENTS.md.backup` first. An
existing backup is never overwritten. If `ai-dev-workflow` is already registered from a
different marketplace path, `--force` replaces that marketplace entry as well.

Start a new Codex task after installation and invoke the workflow explicitly:

```text
$dev-workflow <request>
```

Implicit invocation is disabled. Select the main coordinator model in Codex. For
subagents, Codex uses the same role mapping as OpenCode and Pi: analyst uses
`gpt-6-astra`; planner uses `gpt-5.6-sol`; explorer and builder use `gpt-5.6-luna`;
shipper uses `gpt-5.4-mini`; and reviewer uses `gpt-5.6-terra`. The same
material-definition, FEATURE-plan, material-correction, and shipping approval rules
apply. Codex's shipper then requests a scoped network sandbox escalation for its one
direct `git push`; the role brief supplies a clear approval question. A successful
approval authorizes the sandbox escalation, but Git authentication and remote branch
rules remain independent checks.

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

The unified Node installer resolves all required executables, regenerates build outputs,
and then changes the selected harness. It is the only installer; each target uses
its native installation mechanism behind the same interface.

## Canonical workflow sources

Shared workflow behavior lives under `workflow/`:

- `workflow/orchestrator.md` defines routing, approvals, planning, implementation,
  verification, review, correction, and shipping behavior.
- `workflow/roles/*.md` defines the six reusable role contracts.
- `workflow/guidance/*.md` contains focused repository-memory, implementation,
  verification, and web-research guidance composed only into the roles that need it.
- `workflow/manifest.json` declares the command, roles, and supported harnesses.

`scripts/generate.mjs` combines those canonical sources with frontmatter-only native
definitions under `adapters/`. It writes installable artifacts only to ignored
`build/opencode`, `build/pi`, and `build/codex`, preserving OpenCode models and
permissions, Pi tools and permission policies, and Codex skill metadata without
duplicating behavioral prompts.

`templates/AGENTS.global.md` intentionally contains only universal behavioral
guidelines: load repository memory with lower precedence than `AGENTS.md`, think before
coding, prefer simplicity, make surgical changes, and work toward verifiable goals.
Workflow routing, architecture, permissions, implementation quality, and verification
policy stay in canonical coordinator, role, guidance, or harness-specific files rather
than leaking into every global session.

Only definitions and source metadata are tracked. Generated harness artifacts are
ignored, and the installer regenerates them before making changes. After editing
canonical sources or adapter frontmatter, regenerate and check them:

```bash
npm run generate
npm run generate:check
```

The generator uses only Node built-ins. A general template engine is not needed
because the adapters require composition and small harness-specific wrappers, not
arbitrary presentation logic.

## Persistent context

Durable cross-task context lives in a tracked root file when the repository has something
worth preserving:

```text
MEMORY.md
```

Every role reads it after the applicable `AGENTS.md`; `AGENTS.md` wins on conflict. Before
final review, the coordinator considers zero to three new durable architectural or
philosophical choices, then uses a bounded builder to update the file only when needed.
The file is a dense living bullet list under a 1,000-word soft limit: merge overlaps,
rewrite inaccurate entries, and remove obsolete guidance instead of retaining a task
history. New unapproved material rules still require user approval.

Only multi-session or planned work needs a file:

```text
.ai/work/<branch-slug>.md
```

It contains the approved definition, a durable `## Implementation plan` section, task checklist, current state, verification, and open review findings. The coordinator records the planner's approved plan there in enough detail that each builder implements its slice by reading its plan section plus a short task brief — so delegations carry task-specific scope, not the whole plan. The compact state sections are rewritten and compacted; the plan section stays durable, never an append-only transcript.

The workflow creates `.ai/work/` on demand under the active Git worktree. Global installation never creates runtime project state.

Quick changes usually need no work file. A bug fix only gets one if it becomes multi-session or expands beyond a bounded fix. Git, verification evidence, and the PR remain the durable history.

## Worktrees

- QUICK: current branch if clean and low risk.
- BUGFIX: current branch if clean and bounded.
- FEATURE: isolated branch and worktree under ignored `.worktrees/`.
- Parallel writers: shared worktree only for explicit disjoint paths without repository-wide side effects.
- Dirty repository with unrelated changes: stop for confirmation or isolate from clean `HEAD`.

## Measuring token usage

There is no built-in cross-harness token meter: OpenCode, Pi, and Codex each track usage
their own way, and none exposes a unified per-role figure. Because all three drive the
same `openai/...` models over the OpenAI API, the portable way to measure per-role cost
is a **local logging proxy** in front of every harness:

- Run an OpenAI-compatible proxy locally (for example LiteLLM's proxy, or a minimal Node
  reverse proxy that forwards to the real API) and record `usage.prompt_tokens` and
  `usage.completion_tokens` from each response.
- Point each harness at the proxy by setting its OpenAI base URL to the proxy address
  (OpenCode/Pi/Codex all read the standard `OPENAI_BASE_URL` / provider base-URL
  setting).
- Attribute each request to a role or paired role group. The model tier identifies it
  (`gpt-5.4-mini` → shipper, `gpt-6-astra` → analyst, `gpt-5.6-sol` → planner,
  `gpt-5.6-luna` → explorer/builder, `gpt-5.6-terra` → orchestrator/reviewer), so grouping
  logged usage by model yields that breakdown without any harness changes.

This is intentionally out of the generated package: it is host configuration, not
workflow source. Use the breakdown to see whether cost concentrates in the reasoning
roles (analyst/planner), the review loop, or repeated context, and tune from there.

## Validation

```bash
npm run validate
```

Validation rebuilds ignored harness artifacts, checks their exact generated layout and
content, and exercises installer integrations against those build outputs.

## Status

Three-harness package for OpenCode, Pi, and Codex. Deliberately small: no daemon or hidden state machine.

## License

MIT
