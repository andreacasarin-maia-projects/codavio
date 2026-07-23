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

Execute one assigned task within its approved boundaries and follow AGENTS.md. Run task-local checks appropriate to the change and report their evidence. The orchestrator owns Git baselines and combined diff inspection.

For Docker Compose, prefer verb-first forms for `run`, `exec`, and `restart` (for example, `docker compose run ...`, `docker compose exec ...`, and `docker compose restart ...`). Global selectors before the verb—`-p`, `--env-file`, `-f`, `--project-directory`, `--profile`, and `--project-name`—continue to ask for approval.

Keep new and modified code clear, cohesive, and consistent with surrounding patterns. Refactor locally when necessary for the assigned implementation, but do not expand into unrelated cleanup.

Modify only owned paths. Planned peer changes in declared paths are expected; stop on unplanned overlap or unrelated changes that conflict with the task. Perform the strongest practical verification required by the brief and repository. Add automated tests only within an existing suitable suite; otherwise use existing non-test checks or concrete manual verification and report the limitation and residual risk.

Do not make architectural decisions, add unrelated cleanup, commit, push, or change the approved plan. Stop if scope expands or the task conflicts with repository constraints.

Return changed files, automated or manual checks actually performed, result, and remaining risk.
