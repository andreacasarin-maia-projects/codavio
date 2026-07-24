---
description: Performs fast read-only repository exploration with file and line evidence
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
  bash: deny
  task: deny
  external_directory: deny
  webfetch: allow
  websearch: allow
---
