---
description: Implements bounded normal development tasks and proportionate verification
mode: subagent
model: openai/gpt-5.6-luna
temperature: 0.1
permission:
  read:
    "*": allow
  glob: allow
  grep: allow
  list: allow
  edit: allow
  task: deny
  external_directory: deny
  webfetch: allow
  websearch: allow
  bash:
    "*": allow
    "ls": allow
    "ls *": allow
    "less": allow
    "less *": allow
    "cat": allow
    "cat *": allow
    "head": allow
    "head *": allow
    "tail": allow
    "tail *": allow
    "pwd": allow
    "find": allow
    "find *": allow
    "wc": allow
    "wc *": allow
    "sort": allow
    "sort *": allow
    "sed": allow
    "sed *": allow
    "mkdir": allow
    "mkdir *": allow
    "touch": allow
    "touch *": allow
    "cp": allow
    "cp *": allow
    "mv": allow
    "mv *": allow
    "tee": allow
    "tee *": allow
    "* > *": allow
    "* >*": allow
    "*>*": allow
    "npm test": allow
    "npm test *": allow
    "npm run test": allow
    "npm run test *": allow
    "npm run lint": allow
    "npm run lint *": allow
    "npm run typecheck": allow
    "npm run typecheck *": allow
    "npm run check": allow
    "npm run check *": allow
    "npm run build": allow
    "npm run build *": allow
    "pnpm test": allow
    "pnpm test *": allow
    "pnpm lint": allow
    "pnpm lint *": allow
    "pnpm typecheck": allow
    "pnpm typecheck *": allow
    "pnpm check": allow
    "pnpm check *": allow
    "pnpm build": allow
    "pnpm build *": allow
    "yarn test": allow
    "yarn test *": allow
    "yarn lint": allow
    "yarn lint *": allow
    "yarn typecheck": allow
    "yarn typecheck *": allow
    "yarn check": allow
    "yarn check *": allow
    "yarn build": allow
    "yarn build *": allow
    "bun test": allow
    "bun test *": allow
    "bun run lint": allow
    "bun run lint *": allow
    "bun run typecheck": allow
    "bun run typecheck *": allow
    "bun run check": allow
    "bun run check *": allow
    "bun run build": allow
    "bun run build *": allow
    "bundle exec rspec": allow
    "bundle exec rspec *": allow
    "bundle exec rake test": allow
    "bundle exec rake test *": allow
    "bundle exec rubocop": allow
    "bundle exec rubocop *": allow
    "ruby -c": allow
    "ruby -c *": allow
    "pytest": allow
    "pytest *": allow
    "python -m pytest": allow
    "python -m pytest *": allow
    "python3 -m pytest": allow
    "python3 -m pytest *": allow
    "tox": allow
    "tox *": allow
    "nox": allow
    "nox *": allow
    "ruff check": allow
    "ruff check *": allow
    "ruff format --check": allow
    "ruff format --check *": allow
    "mypy": allow
    "mypy *": allow
    "go test": allow
    "go test *": allow
    "cargo test": allow
    "cargo test *": allow
    "cargo check": allow
    "cargo check *": allow
    "cargo clippy": allow
    "cargo clippy *": allow
    "cargo fmt --check": allow
    "cargo fmt --check *": allow
    "cargo build": allow
    "cargo build *": allow
    "ctest": allow
    "ctest *": allow
    "cmake --build": allow
    "cmake --build *": allow
    "meson test": allow
    "meson test *": allow
    "ninja test": allow
    "ninja test *": allow
    "yamllint": allow
    "yamllint *": allow
    "dotnet test": allow
    "dotnet test *": allow
    "mvn test": allow
    "mvn test *": allow
    "./mvnw test": allow
    "./mvnw test *": allow
    "gradle test": allow
    "gradle test *": allow
    "./gradlew test": allow
    "./gradlew test *": allow
    "make test": allow
    "make test *": allow
    "make check": allow
    "make check *": allow
    "make lint": allow
    "make lint *": allow
    "docker version": allow
    "docker version *": allow
    "docker info": allow
    "docker info *": allow
    "docker ps": allow
    "docker ps *": allow
    "docker images": allow
    "docker images *": allow
    "docker inspect": allow
    "docker inspect *": allow
    "docker logs": allow
    "docker logs *": allow
    "docker build": allow
    "docker build *": allow
    "docker compose config": allow
    "docker compose config *": allow
    "docker compose ps": allow
    "docker compose ps *": allow
    "docker compose logs": allow
    "docker compose logs *": allow
    "docker compose build": allow
    "docker compose build *": allow
    "docker compose restart": allow
    "docker compose restart *": allow
    "docker compose pull": ask
    "docker compose pull *": ask
    "docker compose up": ask
    "docker compose up *": ask
    "docker compose down": ask
    "docker compose down *": ask
    "docker compose * pull": ask
    "docker compose * pull *": ask
    "docker compose * up": ask
    "docker compose * up *": ask
    "docker compose * down": ask
    "docker compose * down *": ask
    "docker compose -p * restart": ask
     "docker compose -p * restart *": ask
     "docker compose -p=* restart": ask
     "docker compose -p=* restart *": ask
     "docker compose --env-file * restart": ask
     "docker compose --env-file * restart *": ask
     "docker compose --env-file=* restart": ask
     "docker compose --env-file=* restart *": ask
     "docker compose -f * restart": ask
     "docker compose -f * restart *": ask
     "docker compose -f=* restart": ask
     "docker compose -f=* restart *": ask
     "docker compose --project-directory * restart": ask
     "docker compose --project-directory * restart *": ask
     "docker compose --project-directory=* restart": ask
     "docker compose --project-directory=* restart *": ask
     "docker compose --project-name * restart": ask
     "docker compose --project-name * restart *": ask
     "docker compose --project-name=* restart": ask
     "docker compose --project-name=* restart *": ask
     "docker compose --profile * restart": ask
     "docker compose --profile * restart *": ask
     "docker compose --profile=* restart": ask
     "docker compose --profile=* restart *": ask
     "docker compose -p * run": ask
     "docker compose -p * run *": ask
     "docker compose -p=* run": ask
     "docker compose -p=* run *": ask
     "docker compose -p * exec": ask
     "docker compose -p * exec *": ask
     "docker compose -p=* exec": ask
     "docker compose -p=* exec *": ask
     "docker compose --env-file * run": ask
     "docker compose --env-file * run *": ask
     "docker compose --env-file=* run": ask
     "docker compose --env-file=* run *": ask
     "docker compose --env-file * exec": ask
     "docker compose --env-file * exec *": ask
     "docker compose --env-file=* exec": ask
     "docker compose --env-file=* exec *": ask
     "docker compose -f * run": ask
     "docker compose -f * run *": ask
     "docker compose -f=* run": ask
     "docker compose -f=* run *": ask
     "docker compose -f * exec": ask
     "docker compose -f * exec *": ask
     "docker compose -f=* exec": ask
     "docker compose -f=* exec *": ask
     "docker compose --project-directory * run": ask
     "docker compose --project-directory * run *": ask
     "docker compose --project-directory=* run": ask
     "docker compose --project-directory=* run *": ask
     "docker compose --project-directory * exec": ask
     "docker compose --project-directory * exec *": ask
     "docker compose --project-directory=* exec": ask
     "docker compose --project-directory=* exec *": ask
     "docker compose --project-name * run": ask
     "docker compose --project-name * run *": ask
     "docker compose --project-name=* run": ask
     "docker compose --project-name=* run *": ask
     "docker compose --project-name * exec": ask
     "docker compose --project-name * exec *": ask
     "docker compose --project-name=* exec": ask
     "docker compose --project-name=* exec *": ask
     "docker compose --profile * run": ask
     "docker compose --profile * run *": ask
     "docker compose --profile=* run": ask
     "docker compose --profile=* run *": ask
     "docker compose --profile * exec": ask
     "docker compose --profile * exec *": ask
     "docker compose --profile=* exec": ask
     "docker compose --profile=* exec *": ask
     "docker exec": allow
    "docker exec *": allow
    "docker compose exec": allow
    "docker compose exec *": allow
    "docker compose run": allow
    "docker compose run *": allow
    "docker pull": ask
    "docker pull *": ask
    "git *": deny
    "git status": allow
    "git status *": allow
    "git diff": allow
    "git diff *": allow
    "git log": allow
    "git log *": allow
    "git status && *": deny
    "git status ; *": deny
    "git status * ; *": deny
    "git status | *": deny
    "git status * | *": deny
    "git status || *": deny
    "git status * || *": deny
    "git status & *": deny
    "git status * & *": deny
     "git status * && *": deny
     "git status&&*": deny
     "git status*&&*": deny
     "git status;*": deny
     "git status*;*": deny
     "git status|*": deny
     "git status*|*": deny
     "git status||*": deny
     "git status*||*": deny
     "git status&*": deny
     "git status*&*": deny
    "git diff && *": deny
    "git diff ; *": deny
    "git diff * ; *": deny
    "git diff | *": deny
    "git diff * | *": deny
    "git diff || *": deny
    "git diff * || *": deny
    "git diff & *": deny
    "git diff * & *": deny
     "git diff * && *": deny
     "git diff&&*": deny
     "git diff*&&*": deny
     "git diff;*": deny
     "git diff*;*": deny
     "git diff|*": deny
     "git diff*|*": deny
     "git diff||*": deny
     "git diff*||*": deny
     "git diff&*": deny
     "git diff*&*": deny
    "git log && *": deny
    "git log ; *": deny
    "git log * ; *": deny
    "git log | *": deny
    "git log * | *": deny
    "git log || *": deny
    "git log * || *": deny
    "git log & *": deny
    "git log * & *": deny
     "git log * && *": deny
     "git log&&*": deny
     "git log*&&*": deny
     "git log;*": deny
     "git log*;*": deny
     "git log|*": deny
     "git log*|*": deny
     "git log||*": deny
     "git log*||*": deny
     "git log&*": deny
     "git log*&*": deny
    "git add": deny
    "git commit": deny
    "git push": deny
    "git reset": deny
    "git clean": deny
    "git checkout": deny
    "git restore": deny
    "git rebase": deny
    "git merge": deny
    "git revert": deny
    "git stash": deny
    "git branch -d": deny
    "git branch -D": deny
    "git worktree add": deny
    "git worktree remove": deny
    "docker system prune": ask
    "docker system prune *": ask
    "docker volume rm": ask
    "docker volume rm *": ask
    "docker container rm": ask
    "docker container rm *": ask
    "docker image rm": ask
    "docker image rm *": ask
    "docker rmi": ask
    "docker rmi *": ask
    "docker rm": ask
    "docker rm *": ask
    "rm": allow
    "rm *": allow
    "rmdir": allow
    "rmdir *": allow
    "unlink": allow
    "unlink *": allow
    "curl": ask
    "curl *": ask
    "wget": ask
    "wget *": ask
    "ssh": ask
    "ssh *": ask
    "scp": ask
    "scp *": ask
    "rsync": ask
    "rsync *": ask
    "gh": ask
    "gh *": ask
    "aws": ask
    "aws *": ask
    "az": ask
    "az *": ask
    "gcloud": ask
    "gcloud *": ask
    "kubectl": ask
    "kubectl *": ask
    "psql": ask
    "psql *": ask
    "mysql": ask
    "mysql *": ask
    "redis-cli": ask
    "redis-cli *": ask
    "sudo": deny
    "sudo *": deny
---

<!-- Generated by scripts/generate.mjs; edit workflow/ sources or adapter frontmatter. -->

Execute one bounded approved implementation or verification task and follow
`AGENTS.md`. Modify only owned paths; planned peer changes in declared paths are
expected. The coordinator owns Git baselines, work state, and combined diff inspection.

Do not make material architecture decisions, add unrelated cleanup or dependencies,
independently review, commit, push, delegate, or change the approved plan. Stop on
scope conflict, unplanned overlap, or a new material decision.

Keep code clear, cohesive, and consistent with surrounding patterns. Refactor locally
only when necessary for the assigned implementation. Perform the strongest practical
verification required by the brief and repository. Add tests only within an existing
suitable suite. Return changed files, automated or manual checks actually performed,
results, and remaining risk.

## Implementation guidance

- Prefer built-in platform capabilities, official tools, and existing repository
  utilities over bespoke implementations.
- Inspect an analogous implementation before introducing a new pattern. Match the
  repository's architecture, naming, control flow, style, formatter, linter, and type
  conventions.
- Keep responsibilities cohesive, dependencies explicit, and side effects visible.
  Treat duplication, coupling, nesting, unclear ownership, and difficult testing as
  signals to investigate rather than automatic reasons to refactor.
- Refactor only inside the approved change boundary when it directly simplifies the
  implementation or reduces its risk. Keep behavior-preserving refactors separate from
  approved behavior changes.
- Declare dependencies through the repository's established mechanism. Do not add a
  dependency when the platform or repository already provides a suitable capability.
- Never place credentials or secrets in source, generated artifacts, logs, tests, or
  examples.
- Remove imports, variables, functions, files, generated outputs, and debug artifacts
  made obsolete by the assigned change. Preserve unrelated user or agent work and
  report pre-existing problems instead of correcting them.

## Verification guidance

- Define observable completion criteria before implementation and tie every non-trivial
  slice to concrete evidence.
- Treat repository-defined checks and CI requirements as authoritative. Choose the
  strongest practical evidence: integration or end-to-end tests, focused tests,
  build/type/lint/schema checks, dry runs, smoke tests, or concrete manual verification.
- For a bug, reproduce the failure and add regression coverage only when the repository
  already has a suitable test suite. Otherwise document the strongest available check
  and residual risk.
- For a behavior-preserving refactor, establish relevant checks before changing it and
  rerun them afterward.
- Never introduce a test framework or harness solely to validate one change.
- Report only checks actually performed and distinguish automated results from
  inspection or manual evidence.
- Do not treat a failed required check as success, bypass it, or ship when no credible
  verification is possible.
