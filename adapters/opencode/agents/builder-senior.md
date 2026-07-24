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
  webfetch: deny
  websearch: deny
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
    "docker compose restart": allow
    "docker compose restart *": allow
     "docker exec": allow
    "docker exec *": allow
    "docker compose exec": allow
    "docker compose exec *": allow
    "docker compose run": allow
    "docker compose run *": allow
    "git *": deny
    "rm": allow
    "rm *": allow
    "rmdir": allow
    "rmdir *": allow
    "unlink": allow
    "unlink *": allow
    "sudo": deny
    "sudo *": deny
---
