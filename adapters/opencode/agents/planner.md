---
description: Produces approved-direction software architecture and implementation structure
mode: subagent
model: openai/gpt-5.6-sol
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
