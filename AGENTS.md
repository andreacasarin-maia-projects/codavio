# Repository Instructions

## Scope

- Tracked product is the OpenCode workflow under `.opencode/` and the Pi package under `pi/`: commands and prompts route to role-specific agents through frontmatter; the Pi package keeps its own role prompts, extensions, and manifest declarations; global engineering guidance lives in `templates/AGENTS.global.md`.
- `.opencode/package.json`, `.opencode/package-lock.json`, `.opencode/node_modules/`, and `.opencode/.gitignore` are ignored local OpenCode artifacts, not repository source. Do not include them in changes.
- The Pi package uses source dependencies declared by the tracked root `package.json` and `package-lock.json`; local `node_modules/` is ignored and must not be treated as product source.
- All isolated Git worktrees must live under the active project root in ignored `.worktrees/`; never create a worktree outside the project.
- `.ai/work/` contains per-branch runtime state inside each active project worktree; global installation must never create it under OpenCode configuration.
- Trusted-project permissions are a curated safe list, not an OS sandbox: repository reads/edits, patch deletions, listed shell inspection commands, curated build/test/lint/Docker-build commands, and `webfetch`/`websearch` run without prompts in the relevant roles; direct general network clients and explicit removal commands ask; `.env`, external-directory access, `sudo`, builder Git mutation, force-push, and role boundaries deny.

## Keep Definitions Aligned

- `scripts/validate.mjs` checks the generated adapters, native manifests, and a disposable installer integration for exactly command `dev` and roles `orchestrator`, `analyst`, `planner`, `explorer`, `builder-junior`, `builder-senior`, `reviewer`, `shipper`. Adding or renaming one requires updating `workflow/manifest.json`, generator output, and native frontmatter.
- Keep the command, role files, Pi support files, and docs coordinated when routes, roles, models, verification, or shipping behavior changes.
- Preserve YAML frontmatter. Agents require `description`, `mode`, and explicit `openai/...` `model`; commands require `description` and an existing `agent`.

## Verification

- Run the complete repository check with `npm run check`, `git diff --check`, and focused stale-claim inspection. Tooling uses Node built-ins; Promptfoo evals are intentionally out of scope for this repository.
- For installer changes, set `XDG_CONFIG_HOME` to a disposable directory and verify every installed definition is a symlink back to this repository.

## Installer Gotchas

- Installer links individual agents, commands, and `templates/AGENTS.global.md` into `${XDG_CONFIG_HOME:-$HOME/.config}/opencode`, preserving unrelated global OpenCode files.
- Existing destinations abort installation. `--force` moves each conflict to `<destination>.backup`; an existing backup also aborts rather than being overwritten. Exact obsolete workflow-owned symlinks are removed automatically. After adding or renaming commands, rerun the installer and then restart OpenCode; configuration changes require a restart.
