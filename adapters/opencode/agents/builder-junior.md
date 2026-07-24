---
description: Executes explicit mechanical low-risk edits with minimal scope
mode: subagent
model: openai/gpt-5.4-mini
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
    "*": ask
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
