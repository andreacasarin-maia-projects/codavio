---
description: Verifies shipping preconditions, creates a focused commit, and pushes the current branch
mode: subagent
model: openai/gpt-5.4-mini
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
    "git status *": allow
    "git diff": allow
    "git diff *": allow
    "git log": allow
    "git log *": allow
    "git add": allow
    "git add *": allow
    "git commit": allow
    "git commit *": allow
    "git push": ask
    "git push *": deny
---
