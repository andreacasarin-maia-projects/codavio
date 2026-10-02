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
  analysis, planning, and review as their risk grows.
- **Focused roles.** Analysis, architecture, implementation, review, and shipping have
  separate responsibilities, tools, and model choices.
- **Human decisions stay visible.** Material architecture, API, schema, security,
  infrastructure, migration, and shipping choices remain approval points.
- **Portable by design.** Shared behavior lives in one canonical source and is rendered
  into native artifacts for each supported coding agent.
- **Built for continuity.** Compact work items and selectively loaded living ADRs preserve decisions
  that need to survive long tasks or new sessions.

## How it works

```text
codavio-orchestrate
  → coordinator visibly starts with Builder, Analyst, Designer, or Archivist
  → Archivist supplies relevant prior decisions when needed, before dependent work
  → Designer resolves material product or domain choices only when needed
  → approve a material product definition
  → Analyst finds the repository-native minimum change only when technical analysis is needed
  → Designer or Analyst may request focused internal Explorer evidence
  → approve only material unresolved technical decisions
  → delegate every implementation, test, and Docker action to a builder
  → builder performs a final simplification pass
  → Archivist maintains relevant living ADRs and human-facing documentation
  → invoke an independent traceability and minimality review after successful verification
  → accept a materially changed product outcome
  → request shipping approval
  → delegate the approved focused commit series and push
```

Role behavior:

- Designer resolves material product and domain uncertainty: it evaluates definition confidence, asks only decision-changing questions with recommendations, uses Event Storming and flow analysis when useful, and proposes the definition.
- Analyst turns defined behavior and focused repository evidence into the smallest executable implementation brief, naming the closest exemplar and justifying every new concept.
- Explorer answers focused internal evidence questions; it never chooses product behavior or technical design.
- Archivist retrieves relevant documented decisions and maintains approved ADRs, README files,
  and technical documentation. Discovery assignments are read-only; writing assignments own
  exact documentation paths. It does not choose architecture or execute commands.
- Builder is the implementation worker for mechanical edits, normal development,
  test execution, integration verification, and approved Docker execution, and performs a final simplification pass. Multiple builder instances require design-independent work and disjoint ownership.
- Reviewer remains evidence-only and read-only, and blocks unjustified production machinery.
- Builder may auto-run verb-first `docker compose run`, `docker compose exec`, and `docker compose restart`; global selectors before the verb (`-p`, `--env-file`, `-f`, `--project-directory`, `--profile`, and `--project-name`) ask, and `docker compose pull`, `up`, `down`, and resource removal ask.

Each native role is a least-privilege authority kernel that explicitly loads one portable
procedure skill:

| Skill | Role |
|---|---|
| `codavio-orchestrate` | orchestrator |
| `codavio-design` | designer |
| `codavio-analyze` | analyst |
| `codavio-explore` | explorer |
| `codavio-archive` | archivist |
| `codavio-build` | builder |
| `codavio-review` | reviewer |
| `codavio-ship` | shipper |

Workflow entry is explicit; Codex metadata also disables implicit skill invocation. Once started,
orchestration remains active and reloads `codavio-orchestrate` on every subsequent turn until
completion or an explicit pause, cancel, or exit. Corrections and deviations are routed back
through roles; they never authorize the orchestrator to perform role work itself.

Role model routing (OpenCode pins all roles; Pi and Codex pin subagents):

| Role | Model | Reasoning |
|---|---|---|
| Orchestration | `openai/gpt-6-sol` | `medium` |
| Product and domain design | `openai/gpt-6-astra` | `medium` |
| Technical analysis | `openai/gpt-6-sol` | `medium` |
| Exploration | `openai/gpt-6-luna` | `low` |
| Documentation | `openai/gpt-6-luna` | `medium` |
| Implementation | `openai/gpt-6-luna` | `medium` |
| Review | `openai/gpt-6-sol` | `high` |
| Shipping | `openai/gpt-6-luna` | `low` |

## Principles

- Progressive ceremony: small changes stay small.
- Code is an ongoing liability: planning, implementation, and review prefer the smallest
  maintainable surface that satisfies approved behavior, minimizing concepts and compatibility
  paths rather than optimizing for raw line count. Approximately 500 human-authored lines in one
  source file or refactor trigger responsibility and reviewability assessment, not automatic
  rejection.
- Entry is observable and proportional: clear localized work starts with Builder, defined
  non-trivial work starts with Analyst, and only material product or domain uncertainty starts
  with Designer. Documentation-only discovery or maintenance starts with Archivist. Request
  labels such as bug or feature do not determine the path.
- An explicit, unambiguous request serves as approval for its stated behavior.
- The user owns material architecture, API, schema, security, infrastructure, migration, and destructive decisions.
- After required approvals, routine high-confidence in-scope work proceeds without progress confirmation and interrupts only for material decisions, conflicts, worker failure, unexpected required-check failure, or mandatory gates.
- Every change gets verification proportionate to its behavior and risk.
- Builders execute every implementation, test, and Docker action; the coordinator never substitutes for them. In multi-builder work, a final sequential integration-verification pass may add approved cross-component tests only within an existing suitable suite and runs the combined verification. It returns compact evidence and does not silently fix or re-scope failures.
- Archivists own documentation edits separately from builder implementation paths. They use
  read/search and edit/write tools only; executable documentation checks belong to builders.
- Baseline checks are encouraged for complex or high-risk work, not mandatory. If a baseline fails, a builder repairs it before continuing and retains the evidence.
- Bug fixes add regression coverage only within an existing suitable test suite; otherwise they use and document the strongest existing verification.
- Worktrees isolate material, risky, parallel, multi-session work or unrelated dirty changes; parallel writers require design-independent tasks and explicit disjoint ownership.
- Explorer and builder roles are reusable capability profiles rather than singletons:
  independent explorer lanes may run concurrently, and multiple builders may run
  concurrently when their write scopes and side effects are disjoint.
- Codavio works in the current checkout by default. Workspace changes require an explicit user request and use the harness lifecycle when available; there is no automatic creation fallback. See `skills/codavio-orchestrate/references/work-state.md` for the canonical checkout and resume rules.
- The conversation is not the source of truth. Planned, parallel, or multi-session work uses a compact living feature-named work item independent of its branch name.
- The work file is the single durable planning artifact. Coordinators project minimal role-specific
  task envelopes from it instead of sending lower-capability workers the whole plan or history.
- Analyzed work uses the smallest applicable implementation brief. Task graphs and commit plans
  appear only when the change needs them; one focused commit remains the default.
- Living ADRs hold current approved project decisions and relevant rationale. Update existing
  topic records, use Git for revision history, and load only task-relevant records. Legacy memory
  is a migration source; new decisions go to ADRs. README and usage docs remain part of delivery.
- Orchestrator is coordination-only: it owns entry selection, approvals, `.ai/work` state, current checkout metadata, and execution delegation; it does not perform product design, technical analysis, implementation, or diff inspection. Designer owns unresolved product and domain choices, Analyst owns the minimum-change implementation brief, and Reviewer owns authoritative diff inspection.
- Reviewer stays read-only and evidence-based; it does not execute tests or Docker. Shipping remains an independent least-privilege subagent gate.
- Review corrections proceed autonomously when they stay inside approved behavior, scope, architecture, dependencies, migrations, acceptance criteria, and risk; changing one of those boundaries requires approval.

## Permissions

Trusted-project permissions are a curated safe list, not an OS sandbox:

- Repository reads (including `.env` files), edits, patch deletions, file listing, globbing, searching, and common project-local shell writes/deletions (`mkdir`, `touch`, `cp`, `mv`, `tee`, `sed`, `rm`, `rmdir`, `unlink`, `find`, and common redirection forms) run without prompts in the relevant roles.
- Curated build/test/lint/typecheck/check commands and Docker build commands run without prompts in the relevant roles. Web access — OpenCode `webfetch`/`websearch` and Pi `web_search`/`fetch_content`/`get_search_content` — is allowed only for the research roles (designer and analyst) and denied for every other role.
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

The installer first generates ignored `build/opencode` artifacts, then symlinks its agents,
skills, compatibility command, and minimal global behavioral baseline into
`${XDG_CONFIG_HOME:-$HOME/.config}/opencode`. After changing definitions, rerun the installer and
restart OpenCode.

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
installation to confirm that child-agent approval forwarding is active. The designer and
analyst use Pi's `web_search`, `fetch_content`, and `get_search_content` tools for
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
The native skill entry is `/skill:codavio-orchestrate <request>`; `/codavio` remains the
compatibility prompt.

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
The generated `codavio-orchestrate` skill routes each worker delegation to its matching
`references/<role>.md` brief inside the installed plugin. Every brief explicitly loads its own
portable role skill.

Start a new Codex task after installation and invoke the workflow explicitly:

```text
$codavio-orchestrate <request>
```

Implicit invocation is disabled. Select `gpt-6-sol` with `medium` reasoning for the main
coordinator in Codex when available; Codavio does not override the main session selection.
Subagents use the role model routing above. The same material-definition, technical-decision,
outcome-acceptance, correction, and shipping approval rules apply. Codex's shipper then requests a scoped network sandbox escalation for its one
direct `git push`; the role brief supplies a clear approval question. A successful
approval authorizes the sandbox escalation, but Git authentication and remote branch
rules remain independent checks.

## Entry points

| Harness | Entry point | Purpose |
|---|---|---|
| OpenCode | `/codavio` | Compatibility command that enters the orchestrator role |
| Pi | `/skill:codavio-orchestrate` | Explicitly run the portable orchestration skill |
| Codex | `$codavio-orchestrate` | Explicitly run the portable orchestration skill |

Codex reserves slash commands for its own interface. Installed workflows are skills, so
Codavio uses the platform-native `$codavio-orchestrate` mention there; `/skills` opens the Codex
skill selector. `$codavio` remains a thin compatibility launcher.

Install every supported harness after their CLIs are available:

```bash
node scripts/install.mjs all
```

The unified Node installer resolves all required executables, regenerates build outputs,
and then changes the selected harness. It is also the refresh path: rerunning it replaces the Pi
package and Codex plugin through their native installers, while OpenCode prunes obsolete agent,
command, and skill links only when their targets are proven to belong to this checkout or its
former `ai-dev-workflow` sibling. Unrelated files, backups, project `.ai/work/` state, and harness
caches are preserved. Pass `--force` only to apply the existing conflict-backup behavior for
current destinations.

## Canonical workflow sources

Canonical behavior is split by concern:

- `skills/codavio-*/SKILL.md` are Portable Agent Skill directories and define each role's
  procedure. The orchestration skill owns work-state references; `codavio-archive` owns
  documentation discovery and living-ADR maintenance guidance.
- `workflow/orchestrator.md` and `workflow/roles/*.md` are small persistent authority kernels:
  they enforce boundaries, load the assigned skill, and fail closed if it is unavailable.
- `workflow/guidance/*.md` contains shared code-quality, implementation, verification, and
  web-research guidance composed only into the native roles that need it.
- `workflow/manifest.json` declares the command, roles, supported harnesses, and exact
  `roleSkills` mapping. `workflow/capabilities.json` owns model and permission policy.

`scripts/generate.mjs` combines those canonical sources with frontmatter-only native
definitions under `adapters/`. It copies the portable skills and writes installable artifacts
only to ignored
`build/opencode`, `build/pi`, and `build/codex`, preserving OpenCode models and
permissions, Pi tools and permission policies, and Codex skill metadata without
embedding skill procedures into generated roles.

`templates/AGENTS.global.md` intentionally contains only universal behavioral
guidelines: think before coding, prefer simplicity, make surgical changes, and work toward
verifiable goals. Project decision discovery belongs to the workflow, not the global template.
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

Durable cross-task decisions live in versioned ADRs. Follow an existing repository location;
otherwise use:

```text
.ai/adrs/<stable-topic>.md
```

Codavio uses **living ADRs**: one stable file per significant decision or tightly related concern,
updated in place as the approved decision changes. Each record states its scope, current choice,
context and rationale, relevant alternatives, consequences, and conditions for reconsideration.
Retain earlier rationale only when it explains the current choice; Git holds full revision history.
Compact overlap and merge or remove redundant guidance, without discarding a decision merely
because it is old. Respect existing immutable ADR conventions unless the user approves a change.

Search relevant README files, design docs, legacy memory, code comments, and available work items
for prior decisions even when a project has no ADRs. Distinguish approved choices from observed
implementation and inference; do not invent missing rationale. Discover records through their
titles and scope, read only those relevant to the task, and pass bounded decision context to
workers. Do not load the entire collection or Git history by default.

The archivist returns compact source-linked decision briefs when workers need prior context,
then maintains documentation from approved choices and implementation evidence. The designer
and analyst own product and technical reasoning; the coordinator routes existing approval and
records paths and evidence. The reviewer checks documentation against the final implementation,
and the shipper includes approved documentation in coherent commit groups. Ordinary changes need
no ADR, and documentation creates no separate approval gate or mandatory discovery pass.
Existing authorization can cover a decision change; otherwise material reversals need approval.

`MEMORY.md` is a legacy migration source only, not a destination for future decisions. Migrate
still-relevant choices, resolve conflicts, and remove it when requested. This repository's former
memory entries now live under [.ai/adrs/](.ai/adrs/); its remaining memory file is a removable
migration pointer. Applicable `AGENTS.md` files govern instructions when present; projects need
no `AGENTS.md` as a memory store. The global template contains only behavioral guidance.

README, usage, API, and maintenance docs still explain the project to humans and AI. Update
affected commands, examples, and behavior as part of delivery, linking decision rationale rather
than duplicating it. The archivist loads
[living-ADR guidance](skills/codavio-archive/references/adrs.md) only for ADR maintenance or migration;
other workers receive relevant decisions instead of this procedure or the whole collection.
When `.ai/` is ignored, include only `.ai/adrs/` in version control; keep `.ai/work/` runtime state
ignored. No mandatory index or historical backfill is required.

Only planned, parallel, or multi-session work needs a file:

```text
.ai/work/<work-id>.md
```

The work ID is a stable, human-readable feature slug such as `guest-checkout`, independent of the branch name. Metadata records its title, status, branch, current checkout path, and external lifecycle owner when available. Legacy `route` metadata remains valid but is not written for new work. Existing records that lack checkout metadata remain valid. Recorded paths provide resume context; a mismatch with the current checkout requires user resolution before dependent work. The file contains only the applicable leadership brief, discovery map, approved definition, durable implementation brief, delivery state, verification, review, acceptance, and shipping state. Formal task graphs and commit plans appear only when required. The coordinator keeps this file canonical and sends each worker only a minimal projection containing its task and relevant references. Compact sections are rewritten rather than appended as a transcript.

Multiple work items may coexist. Codavio resolves an explicit work ID first, then matching branch or worktree metadata, then a sole active item; ambiguous candidates require selection. Existing `.ai/work/<branch-slug>.md` files remain recognized as legacy state and are never silently overwritten or renamed.

The workflow creates feature-named `.ai/work/` state on demand inside the current checkout, independent of branch naming. Global installation never creates runtime project state.

Clear localized changes usually need no work file. Git, verification evidence, and the PR remain the durable history.

## Workspaces

- Use the current checkout regardless of task size, risk, or session duration.
- Never create, switch, attach, or clean up worktrees automatically. Workspace changes require an explicit user request.
- For a requested change, use the harness or workspace manager when available. Without a manager, the coordinator may use direct Git worktree commands with visible approval; forced mutations remain blocked.
- Parallel writers require design-independent tasks, explicit disjoint paths, and no repository-wide side effects; otherwise run them sequentially.
- Preserve unrelated user changes. Stop and report overlapping changes before dependent work.

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
  lanes (`gpt-6-astra`/`medium` → designer, `gpt-6-sol`/`medium` → orchestrator/analyst,
  `gpt-6-sol`/`high` → reviewer, `gpt-6-luna`/`medium` → archivist/builder, and
  `gpt-6-luna`/`low` → explorer/shipper), so grouping logged usage by both fields yields that
  breakdown without harness changes.

This is intentionally out of the generated package: it is host configuration, not
workflow source. Use the breakdown to see whether cost concentrates in the reasoning
roles (designer/analyst), the review loop, or repeated context, and tune from there.

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
