# Role capabilities

`capabilities.json` is the single source for each role's **model policy and wiring**. The
generator expands it into every harness's native dialect (OpenCode permission frontmatter,
Pi frontmatter + guards, Codex prose), so the same policy can never drift between harnesses.

This is deliberately a **thin policy layer, not a permission DSL**. It declares only what a
risk classifier cannot infer — hard boundaries and workflow structure. The *gray zone*
(is this specific command an appropriate verification step?) is left to role prose (intent)
plus each harness's native adjudication (ask tier, or an AI classifier where one exists).
See [Gray-zone adjudication](#gray-zone-adjudication).

Role *behaviour* (what each role should do) lives in `workflow/roles/*.md`, already single
sourced. Worker display descriptions live in `workflow/manifest.json`; only the orchestrator's
description remains here because it is not a manifest worker role. `capabilities.json` otherwise
covers model selection, reasoning effort, and the config/permission layer.

## Role fields

| field | values | meaning |
| --- | --- | --- |
| `model` | bare model id | renderers add the `openai/` prefix for OpenCode and Pi |
| `reasoning` | `low` \| `medium` \| `high` | role-specific reasoning effort rendered in each harness's native dialect |
| `mode` | `primary` \| `subagent` | OpenCode agent mode; only the orchestrator is `primary` |
| `git` | `none` \| `orient` \| `inspect` \| `commit` | Git access level (see below) |
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
| `model` | `model: openai/<id>` | `model: openai/<id>` | model assignment in generated skill delegation prose |
| `reasoning` | `reasoningEffort: <level>` | `thinking: <level>` | `thinking: <level>` delegation argument in generated skill prose |
| `mode` | `mode: <value>` | (main session vs subagent) | n/a |
| `git: <level>` | `bash` base `deny` + `constants.git[level]` allows (each as `"<cmd>"` and `"<cmd> *"`) | `bash` tool + role guard restricting to the level | prose ("reads the diff" / "Git-only shipping") |
| `web: true` | `webfetch/websearch: allow` | `web_search,fetch_content,get_search_content` in `tools:` | — |
| `web: false` | `webfetch/websearch: deny` | omit web tools | — |
| `edit: owned` | `edit: allow` | `edit,write` in `tools:` | prose ("modify owned paths") |
| `edit: work-file` | `edit: { "*": deny, ".ai/work/**": allow }` | (main session) | n/a |
| `edit: none` | `edit: deny` | omit `edit,write` | prose ("read-only") |
| `shell: verify[...]` | `bash` base `ask` + `builderShell` allows | `bash` in `tools:` + builder guard | prose ("edits + verification") |
| `hardDeny` (`sudo`) | `"sudo": deny`, `"sudo *": deny` | builder/coordinator guard | prose |
| `delegate: true` | `task:` allowlist of the worker roles | (main session invokes subagents) | prose |
| `guard: <name>` | n/a | register `<name>-guard` extension | n/a |
| guidance (derived) | append docs to body | append docs to body | append docs to `roles.md` brief |

Constants applied uniformly (not per role): `constants.opencode` / `constants.pi`
(`external_directory: deny`, Pi inherit flags). Each command in a set renders as both its
bare form and its `<cmd> *` wildcard, except `redirect` entries which are used verbatim.

Repository-memory guidance is appended to every role body. Work-state guidance is appended
to the orchestrator before repository-memory guidance. The remaining guidance docs are
**derived from role capabilities** (in `roleBody`), so they cannot contradict the policy:

- orchestrator → `work-state.md`, then `memory.md`
- every role → `memory.md`
- `edit == "owned"` → `implementation.md`
- `shell` starts with `verify` **or** `git == "inspect"` → `verification.md`
- `web == true` → `web-use.md`

Worker guidance is appended in that order (the builder gets memory, implementation, then
verification; reviewer gets memory then verification; analyst/planner get memory then web
research).

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
- **Codex** — model assignments derived via `codexModelSentence` (byte-identical output);
  role briefs and boundaries were already prose from the role bodies.

`scripts/validate.mjs` checks that generated model lines match `capabilities.json`, so the
spec and the generated harness files cannot drift.
