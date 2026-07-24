---
description: Performs an independent, read-only review against the approved definition and repository constraints
mode: subagent
model: openai/gpt-5.6-terra
temperature: 0.1
permission:
  read:
    "*": allow
  glob: allow
  grep: allow
  list: allow
  edit: deny
  task: deny
  external_directory: deny
  webfetch: deny
  websearch: deny
  bash:
    "*": deny
    "git status": allow
    "git diff": allow
    "git log": allow
---
