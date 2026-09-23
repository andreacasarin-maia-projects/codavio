# Codavio

**A steady path from a coding request to a reviewed change.**

Codavio is an adaptable development workflow for coding agents. It helps carry a request
from its first description through repository analysis, planning, implementation,
verification, independent review, and optional Git shipping. One coordinator keeps the
work coherent while focused agents handle each part with the context and permissions they
need.

The name joins **code** with **via**: the Italian and Latin word for a way or path. Codavio
is meant to feel like a capable companion in the development process—present when the work
needs structure, quiet when it does not.

Codavio currently supports OpenCode, Pi, and Codex from one set of canonical workflow
sources. Each harness receives native commands, role definitions, model assignments, and
permission rules generated for its own runtime.

Repository tooling and installation require Node.js 22.6 or newer.

## Why Codavio

- **One request, one visible path.** The coordinator makes the route and approval gates
  explicit, so the work can be followed from intent to evidence.
- **Structure that fits the task.** Quick changes stay compact; bug fixes and features add
  analysis, planning, isolation, and review as their risk grows.
- **Focused roles.** Analysis, architecture, implementation, review, and shipping have
  separate responsibilities, tools, and model choices.
- **Human decisions stay visible.** Material architecture, API, schema, security,
  infrastructure, migration, and shipping choices remain approval points.
- **Portable by design.** Shared behavior lives in one canonical source and is rendered
  into native artifacts for each supported coding agent.
- **Built for continuity.** Compact work items and repository memory preserve decisions
  that need to survive long tasks or new sessions.

## How it works

```text
/codavio
  → coordinator visibly declares QUICK, BUGFIX, or FEATURE before task work
  → BUGFIX invokes a focused explorer first
  → FEATURE invokes an analyst first to assess confidence and collaboratively design the functionality
  → analyst may request high-level DISCOVERY exploration when repository evidence could change the feature
  → discuss and approve the feature definition and product direction
  → planner identifies technical unknowns and may request targeted PLANNING exploration
  → planner turns the approved definition and returned evidence into architecture, a task graph, and a commit plan
  → approve the architecture plan when required
  → treat an explicit unambiguous QUICK request as its definition approval
  → delegate every implementation, test, and Docker action to a builder
  → compact durable architectural and philosophical context into MEMORY.md
  → invoke an independent reviewer after successful verification
  → accept the outcome of a material FEATURE
  → request shipping approval
  → delegate the approved focused commit series and push
```

Role behavior:

- Analyst acts as the product discovery and solution-design partner: it evaluates definition confidence, asks only decision-changing questions with recommendations, uses Event Storming and flow analysis when useful, and proposes the feature definition.
- Explorer answers focused `DISCOVERY`, `PLANNING`, or `BUGFIX` questions with repository evidence; it never chooses product behavior or architecture.
- Planner converts the approved feature definition and targeted repository evidence into component boundaries, interfaces, data and control flow, failure semantics, migration strategy, a traceable builder-sized task graph, integration verification, and an ordered commit plan.
- Builder is the implementation worker for mechanical edits, normal development,
  test execution, integration verification, and approved Docker execution. Multiple
  builder instances may run concurrently only with disjoint ownership.
- Reviewer remains evidence-only and read-only.
- Builder may auto-run verb-first `docker compose run`, `docker compose exec`, and `docker compose restart`; global selectors before the verb (`-p`, `--env-file`, `-f`, `--project-directory`, `--profile`, and `--project-name`) ask, and `docker compose pull`, `up`, `down`, and resource removal ask.

Role model routing (OpenCode pins all roles; Pi and Codex pin subagents):

| Role | Model | Reasoning |
|---|---|---|
| Orchestration | `openai/gpt-6-sol` | `medium` |
| Product discovery and solution design | `openai/gpt-6-astra` | `medium` |
| Architecture and task planning | `openai/gpt-6-sol` | `medium` |
| Exploration | `openai/gpt-6-luna` | `low` |
| Implementation | `openai/gpt-6-luna` | `medium` |
| Review | `openai/gpt-6-sol` | `high` |
| Shipping | `openai/gpt-6-luna` | `low` |

## Principles

- Progressive ceremony: small changes stay small.
- Code is an ongoing liability: planning, implementation, and review prefer the smallest
  maintainable surface that satisfies approved behavior, minimizing concepts and compatibility
  paths rather than optimizing for raw line count.
- Routing is observable and ordered: the coordinator declares QUICK, BUGFIX, or FEATURE
  before task work; BUGFIX starts with an explorer, while FEATURE starts with the analyst
  and cannot enter repository-specific planning before feature-definition approval.
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
- The conversation is not the source of truth. Planned, parallel, or multi-session work uses a compact living feature-named work item independent of its branch name.
- The work file is the single durable planning artifact. Coordinators project minimal role-specific
  task envelopes from it instead of sending lower-capability workers the whole plan or history.
- Planned work uses a dependency-aware task graph with stable IDs and a commit plan. One focused
  commit remains the default; multiple commits are used only when they improve comprehension,
  review, verification, or reversibility.
- Root `MEMORY.md` is dense, living repository context rather than history. Every role reads it after the applicable `AGENTS.md`, which remains authoritative, and the coordinator rewrites it before final review when shipped work makes durable context new, stale, or redundant.
- Orchestrator is coordination-only: it owns routing, approvals, `.ai/work` state, branch and worktree bookkeeping, and execution delegation; it does not perform product discovery, architecture, or diff inspection. Analyst owns the feature definition, planner owns the detailed implementation plan, and reviewer owns authoritative diff inspection.
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
git clone https://github.com/andreacasarin-maia-projects/codavio.git
cd codavio
node scripts/install.mjs opencode
```

The installer first generates ignored `build/opencode` artifacts, then symlinks its agents, command, and minimal global behavioral baseline into `${XDG_CONFIG_HOME:-$HOME/.config}/opencode`. After adding or renaming commands, rerun the installer and then restart OpenCode to reload them. Configuration changes require an OpenCode restart.

Unrelated existing files are preserved. `node scripts/install.mjs opencode --force` moves conflicts at current managed destinations to a sibling `.backup` path before linking.

Run OpenCode inside any Git project:

```text
/codavio <request>
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
not an OS sandbox. Log in to OpenAI in Pi and choose `gpt-6-sol` with `medium` reasoning for the
main coordinator when available. Each delegated role pins the model and reasoning shown in the
role routing table; use
`/subagents-models` after restarting Pi to inspect the live mapping.

Pi must run in a trusted repository: its package extensions do not provide a sandbox. They do not infer GET/POST semantics, and allowed project scripts may have side effects. Start the workflow with `/codavio <request>`, inspect or list state with `/workflow-status [work-id]`, and use `.ai/work/<work-id>.md` for planned, parallel, or multi-session work. For remote work, keep Pi attached to SSH and use `tmux` so the session survives disconnects.

## Install in Codex

Install the generated local marketplace, plugin, and minimal global behavioral baseline:

```bash
node scripts/install.mjs codex
```

The installer generates and registers the marketplace under `build/codex/`, installs the
`codavio` plugin, and links its generated global guidance to
`${CODEX_HOME:-$HOME/.codex}/AGENTS.md`. Existing global guidance aborts installation;
use `node scripts/install.mjs codex --force` to move it to `AGENTS.md.backup` first. An
existing backup is never overwritten. If `codavio` is already registered from a
different marketplace path, `--force` replaces that marketplace entry as well.

Start a new Codex task after installation and invoke the workflow explicitly:

```text
$codavio <request>
```

Implicit invocation is disabled. Select `gpt-6-sol` with `medium` reasoning for the main
coordinator in Codex when available; Codavio does not override the main session selection.
Subagents use the role model routing above. The same
feature-definition, FEATURE-plan, feature-acceptance, material-correction, and shipping approval rules
apply. Codex's shipper then requests a scoped network sandbox escalation for its one
direct `git push`; the role brief supplies a clear approval question. A successful
approval authorizes the sandbox escalation, but Git authentication and remote branch
rules remain independent checks.

## Entry points

| Harness | Entry point | Purpose |
|---|---|---|
| OpenCode | `/codavio` | Orchestrate analysis through approved shipping |
| Pi | `/codavio` | Orchestrate analysis through approved shipping |
| Codex | `$codavio` | Explicitly run the Codex skill |

Codex reserves slash commands for its own interface. Installed workflows are skills, so
Codavio uses the platform-native `$codavio` mention there; `/skills` opens the Codex skill
selector.

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
- `workflow/guidance/*.md` contains focused work-state, repository-memory, implementation,
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

Only planned, parallel, or multi-session work needs a file:

```text
.ai/work/<work-id>.md
```

The work ID is a stable, human-readable feature slug such as `guest-checkout`, independent of the branch name. Metadata records its title, route, status, branch, and worktree when available. The file contains the leadership brief, discovery map, approved feature definition, durable `## Implementation plan`, delivery state, verification, review, acceptance, and shipping state. The implementation plan contains architecture decisions, builder-sized task cards, integration verification, and the commit plan, all connected by stable IDs. The coordinator keeps this file canonical and sends each worker only a minimal projection containing its task and relevant references. Compact sections are rewritten rather than appended as a transcript.

Multiple work items may coexist. Codavio resolves an explicit work ID first, then matching branch or worktree metadata, then a sole active item; ambiguous candidates require selection. Existing `.ai/work/<branch-slug>.md` files remain recognized as legacy state and are never silently overwritten or renamed.

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
- Attribute each request to a role or paired role group. Model plus reasoning identifies most
  lanes (`gpt-6-astra`/`medium` → analyst, `gpt-6-sol`/`medium` → orchestrator/planner,
  `gpt-6-sol`/`high` → reviewer, `gpt-6-luna`/`medium` → builder, and
  `gpt-6-luna`/`low` → explorer/shipper), so grouping logged usage by both fields yields that
  breakdown without harness changes.

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

Codavio supports OpenCode, Pi, and Codex. It stays deliberately small: canonical Markdown
and JSON sources, a Node.js generator and installer, and native artifacts for each
harness—without a daemon or hidden state machine.

## License

MIT
