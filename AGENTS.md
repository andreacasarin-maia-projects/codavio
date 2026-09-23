# Repository Instructions

Read root `MEMORY.md` after this file. This file is authoritative if they conflict; report
conflicting memory as stale.

## Purpose

This project builds a stable, testable, and repeatable AI development workflow that does not depend on always using the most capable model. The end goal is to leverage cheaper models to reach roughly 80% of what the best model could achieve at about 20% of the token cost. Prefer predictable structure, hard-enforced role boundaries, and minimal per-agent context over maximal model capability. Favor a single canonical source per concern, expanded per harness by the generator, over duplicated definitions that can silently diverge.

## Scope

- Tracked product includes canonical workflow sources (including `workflow/capabilities.json`, the single source for per-role model and permission policy), the remaining command/prompt adapters under `adapters/`, templates, native Pi extensions, root package and lock metadata, Codex marketplace/plugin/invocation metadata, scripts, tests, documentation, and the license. The generator writes only generated harness artifacts under ignored `build/opencode`, `build/pi`, and `build/codex`; those build subtrees are not tracked product inputs.
- `.opencode/` is local OpenCode state, not repository source. Do not include its package files, lockfile, node_modules, or local configuration in changes.
- The Pi package uses source dependencies declared by the tracked root `package.json` and `package-lock.json`; local `node_modules/` is ignored and must not be treated as product source.
- All isolated Git worktrees must live under the active project root in ignored `.worktrees/`; never create a worktree outside the project.
- `.ai/work/` contains per-branch runtime state inside each active project worktree; global installation must never create it under OpenCode configuration.
- Trusted-project permissions are a curated safe list, not an OS sandbox: repository reads/edits, patch deletions, listed shell inspection commands, and curated build/test/lint/Docker-build commands run without prompts in the relevant roles; web access (OpenCode `webfetch`/`websearch`, Pi `web_search`/`fetch_content`/`get_search_content`) is allowed only for the research roles (analyst and planner); direct general network clients and explicit removal commands ask; `.env`, external-directory access, `sudo`, all builder Git access, the Pi coordinator session's `git diff`/`git log`, non-research web access, force-push, and role boundaries deny.

## Keep Definitions Aligned

- `scripts/validate.mjs` checks ignored build outputs, native metadata, and a disposable installer integration for exactly command `codavio` and roles `orchestrator`, `analyst`, `planner`, `explorer`, `builder`, `reviewer`, `shipper`. Adding or renaming one requires updating `workflow/manifest.json` and the role entry in `workflow/capabilities.json`.
- OpenCode and Pi agent frontmatter is generated from `workflow/capabilities.json` (see `workflow/capabilities.md` for the field vocabulary and per-harness rendering rules); do not hand-edit generated `build/` frontmatter. Codex role config is prose derived from the role bodies plus the model assignment in `capabilities.json`.
- Keep the command, role files, Pi support files, and docs coordinated when routes, roles, models, verification, or shipping behavior changes.
- Commands still carry hand-written frontmatter and require `description` and an existing `agent`.

## Verification

- Run the complete repository check with `npm run check`, `git diff --check`, and focused stale-claim inspection. Tooling uses Node built-ins; Promptfoo evals are intentionally out of scope for this repository.
- For installer changes, set `XDG_CONFIG_HOME` to a disposable directory and verify every installed definition resolves under the generated `build/` tree.

## Installer Gotchas

- Installer links individual agents, commands, and generated `build/opencode/AGENTS.md` into `${XDG_CONFIG_HOME:-$HOME/.config}/opencode`, preserving unrelated global OpenCode files.
- Existing destinations abort installation. `--force` moves each conflict at a current managed destination to `<destination>.backup`; an existing backup also aborts rather than being overwritten. After adding or renaming commands, rerun the installer and then restart OpenCode; configuration changes require a restart.
