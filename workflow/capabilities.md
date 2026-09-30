# Role capabilities

`capabilities.json` is the single source for each role's **model policy and wiring**. The
generator expands it into every harness's native dialect (OpenCode permission frontmatter,
Pi frontmatter + guards, Codex prose), so the same policy can never drift between harnesses.

This is deliberately a **thin policy layer, not a permission DSL**. It declares only what a
risk classifier cannot infer — hard boundaries and workflow structure. The *gray zone*
(is this specific command an appropriate verification step?) is left to role prose (intent)
plus each harness's native adjudication (ask tier, or an AI classifier where one exists).
See [Gray-zone adjudication](#gray-zone-adjudication).

Role *authority* lives in the small kernels under `workflow/roles/*.md` and
`workflow/orchestrator.md`. Role *procedure* lives in Portable Agent Skill directories under
`skills/`. The `roleSkills` mapping in `workflow/manifest.json` binds each role to exactly one
skill. Worker display descriptions live in the manifest; only the orchestrator's description
remains here because it is not a manifest worker role. `capabilities.json` otherwise covers model
selection, reasoning effort, and the config/permission layer.

## Role fields

| field | values | meaning |
| --- | --- | --- |
| `model` | bare model id | renderers add the `openai/` prefix for OpenCode and Pi |
| `reasoning` | `low` \| `medium` \| `high` | role-specific reasoning effort rendered in each harness's native dialect |
| `mode` | `primary` \| `subagent` | OpenCode agent mode; only the orchestrator is `primary` |
| `git` | `none` \| `orient` \| `inspect` \| `commit` | Git access level (see below) |
| `unmanagedWorktreeFallback` | `ask` (or omitted) | coordinator-only direct `git worktree add` fallback, always requiring visible approval |
| `web` | boolean | web research tools + the `web-use` guidance |
| `edit` | `none` \| `work-file` \| `owned` | file-write scope |
| `shell` | `none` \| `verify` \| `verify+integration` | general (non-Git) shell |
| `delegate` | boolean | may spawn worker roles (orchestrator only) |
| `guard` | `coordinator` \| `builder` \| `reviewer` \| `shipper` \| `null` | Pi runtime guard |

Guidance docs are **derived** from these fields, not declared (see below).

### `git` levels (cumulative)

- `none` — no Git at all.
- `orient` — `rev-parse --show-toplevel`, `branch --show-current`, `status --short`, `worktree list`. Cheap orientation only; **no diff content**.
- `inspect` — `status`, `diff`, `log`, `worktree list`. Read the change.
- `commit` — `inspect` + `add`, `commit`, `push`. Force-push and `--no-verify` are **denied by the guard**, not allowed here.

Command sets live in `constants.git`.

Only the orchestrator has `unmanagedWorktreeFallback: "ask"`. Its Pi guard accepts the two
direct add forms documented in the work-state guidance; the generated harness permission asks
for approval. All other worktree mutations remain denied, and workers receive no worktree
lifecycle permission.

### `edit` scope

- `none` — read-only.
- `work-file` — may write only `.ai/work/**` (the orchestrator, for the work file + plan).
- `owned` — may write repo code within the task's owned paths (builders).

### `shell` levels

- `none` — no general shell. (Git-only roles reach Git through `git`, not `shell`.)
- `verify` — base `ask`, plus the auto-allowed convenience set in `constants.builderShell` (`fileOps` + `redirect` + `verification` + `dockerRead`). Anything else prompts.
- `verify+integration` — `verify` plus `constants.builderShell.integration` (Docker `exec` / `compose exec|run|restart`) for builder integration verification.

The `builderShell` convenience set is a **transitional list**: it exists so harnesses
without an AI classifier don't prompt on every common test command. It is expected to
**shrink over time** as classifiers land (see below); it is not the security boundary.

## Rendering rules

| field | → OpenCode | → Pi | → Codex |
| --- | --- | --- | --- |
| `model` | `model: openai/<id>` | `model: openai/<id>` | assignment in each generated role brief and skill routing prose |
| `reasoning` | `reasoningEffort: <level>` | `thinking: <level>` | assignment in each generated role brief and skill routing prose |
| `mode` | `mode: <value>` | (main session vs subagent) | n/a |
| `git: <level>` | `bash` base `deny` + `constants.git[level]` allows (each as `"<cmd>"` and `"<cmd> *"`) | `bash` tool + role guard restricting to the level | prose ("reads the diff" / "Git-only shipping") |
| `unmanagedWorktreeFallback: ask` | `git worktree add *: ask` | direct approved add forms reach visible ask; guard denies other forms | coordinator work-state instructions |
| `web: true` | `webfetch/websearch: allow` | `web_search,fetch_content,get_search_content` in `tools:` | — |
| `web: false` | `webfetch/websearch: deny` | omit web tools | — |
| `edit: owned` | `edit: allow` | `edit,write` in `tools:` | prose ("modify owned paths") |
| `edit: work-file` | `edit: { "*": deny, ".ai/work/**": allow }` | (main session) | n/a |
| `edit: none` | `edit: deny` | omit `edit,write` | prose ("read-only") |
| `shell: verify[...]` | `bash` base `ask` + `builderShell` allows | `bash` in `tools:` + builder guard | prose ("edits + verification") |
| `hardDeny` (`sudo`) | `"sudo": deny`, `"sudo *": deny` | builder/coordinator guard | prose |
| `delegate: true` | `task:` allowlist of the worker roles | (main session invokes subagents) | prose |
| `roleSkills` mapping | native `skill` permission allows only the assigned skill | `skills` + `skillPath` select only the assigned skill | plugin ships all skills with implicit invocation disabled |
| `guard: <name>` | n/a | register `<name>-guard` extension | n/a |
| guidance (derived) | append docs to body | append docs to body | append docs to each per-role brief |

Codex generates one file per worker at
`skills/codavio-orchestrate/references/<role>.md`; the orchestration `SKILL.md` links each
delegation to exactly one matching file. Each brief contains the role kernel, derived model and
reasoning assignment, selected shared guidance, and the assignment and return-evidence contract.
The worker then explicitly loads its assigned procedure skill. Normal generation removes stale
aggregate references, while check mode rejects unexpected generated files.

Constants applied uniformly (not per role): `constants.opencode` / `constants.pi`
(`external_directory: deny`, Pi inherit flags). Each command in a set renders as both its
bare form and its `<cmd> *` wildcard, except `redirect` entries which are used verbatim.

Repository-memory and work-state guidance are canonical references of
`codavio-orchestrate`; every role artifact also receives the repository-memory guidance. The
remaining shared guidance docs are **derived from role capabilities** (in `roleBody`), so they
cannot contradict the policy:

- every role → `memory.md`
- analyst, builder, and reviewer → `code-quality.md`
- `edit == "owned"` → `implementation.md`
- `shell` starts with `verify` **or** `git == "inspect"` → `verification.md`
- `web == true` → `web-use.md`

Worker guidance is appended in that order (the builder gets memory, code quality, implementation,
then verification; reviewer gets memory, code quality, then verification; analyst gets memory,
code quality, then web research; designer gets memory then web research).

## Gray-zone adjudication

Two layers, and the split is not negotiable:

- **Hard boundaries are deterministic.** Role isolation (builders never Git, shipper
  Git-only, reviewer read-only) and `hardDeny` (`sudo`) render to static `deny` + the Pi
  guards. These must **never** be delegated to a probabilistic classifier — a classifier is
  prompt-injectable, and one bad judgment breaks role isolation.
- **The gray zone is adjudicated at runtime.** "Is this particular command a legitimate
  verification step?" is answered by the harness: OpenCode/Codex's `ask` tier, Pi's
  supervisor/intercom channel (a subagent escalates a decision to the parent coordinator
  LLM), or — if one is added — an AI risk classifier.

A future Pi AI classifier slots into the **gray zone only**: it runs *behind* the
deterministic guards (which already allow/deny the clear cases), on a cheap model, so it
never re-judges what policy already settled. When such a classifier exists, the
`builderShell` convenience set can shrink toward empty for that harness, because the
classifier adjudicates verification commands directly. The spec does not change — the
classifier *consumes* `capabilities.json` (the declared boundaries and role intent) as its
policy input.

## Status

All three harnesses derive their per-role policy from this file. The hand-written agent
permission frontmatter has been deleted; only fixed command/prompt adapters remain under
`adapters/`.

- **OpenCode** — full agent frontmatter via `openCodeFrontmatter`. Parity verified vs. the
  old adapters: differences were consistent key ordering, harmless argument wildcards on
  read-only commands, and benign convergences (reviewer gains argument'd read-only Git).
- **Pi** — full agent frontmatter via `piFrontmatter`. Non-builder roles were byte-identical
  to the old adapters; the builder converged additively from the npm-only set up to the unified
  verification set (nothing removed; `git`/`sudo` still denied and the builder guard still
  enforces hard boundaries).
- **Codex** — role model and reasoning assignments come from `capabilities.json`; the
  orchestration skill links each delegation to a matching role brief, and every role brief loads
  its assigned procedure skill.

`scripts/validate.mjs` checks generated model and reasoning assignments, native role artifacts,
role separation, and the Codex reference routes against the canonical sources and capabilities.
