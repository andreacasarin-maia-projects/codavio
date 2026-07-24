---
description: Orchestrates work from analysis through approved shipping
mode: primary
model: openai/gpt-5.6-terra
temperature: 0.1
permission:
  read:
    "*": allow
  glob: allow
  grep: allow
  list: allow
  edit:
    "*": deny
    ".ai/work/**": allow
  external_directory: deny
  webfetch: deny
  websearch: deny
  bash:
    "*": deny
    "git rev-parse --show-toplevel": allow
    "git branch --show-current": allow
    "git status --short": allow
    "git worktree list": allow
  task:
    "*": deny
    "analyst": allow
    "planner": allow
    "explorer": allow
    "builder-junior": allow
    "builder-senior": allow
    "reviewer": allow
    "shipper": allow
---
