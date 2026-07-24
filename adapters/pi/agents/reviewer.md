---
name: reviewer
description: Performs an independent, read-only review against the approved definition and repository constraints
model: openai/gpt-5.6-terra
tools: read,grep,find,ls,bash
permission:
  tools:
    "*": deny
    read: allow
    grep: allow
    find: allow
    ls: allow
    bash: allow
  bash:
    "*": deny
    "git status": allow
    "git status *": allow
    "git diff": allow
    "git diff *": allow
    "git log": allow
    "git log *": allow
    "git worktree": allow
    "git worktree list": allow
  special:
    external_directory: deny
systemPromptMode: replace
inheritProjectContext: true
inheritSkills: false
maxSubagentDepth: 0
---
