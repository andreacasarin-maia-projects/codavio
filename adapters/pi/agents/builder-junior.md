---
name: builder-junior
description: Executes explicit mechanical low-risk edits with minimal scope
model: openai/gpt-5.4-mini
tools: read,grep,find,ls,edit,write,bash
permission:
  tools:
    "*": ask
    read: allow
    grep: allow
    find: allow
    ls: allow
    edit: allow
    write: allow
    bash: allow
  bash:
    "*": ask
    "ls": allow
    "ls *": allow
    "cat *": allow
    "head *": allow
    "tail *": allow
    "pwd": allow
    "find *": allow
    "wc *": allow
    "sort *": allow
    "sed *": allow
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
    "npm run validate": allow
    "git *": deny
    "git status": allow
    "git status *": allow
    "git diff": allow
    "git diff *": allow
    "git log": allow
    "git log *": allow
    "sudo *": deny
  special:
    external_directory: deny
systemPromptMode: replace
inheritProjectContext: true
inheritSkills: false
maxSubagentDepth: 0
---
