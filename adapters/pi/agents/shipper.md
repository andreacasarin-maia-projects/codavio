---
name: shipper
description: Verifies shipping preconditions, creates a focused commit, and pushes the current branch
model: openai/gpt-5.4-mini
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
    "git add": allow
    "git add *": allow
    "git add .": ask
    "git add -A": ask
    "git add --all": ask
    "git commit": allow
    "git commit *": allow
    "git commit --amend": ask
    "git commit --amend *": ask
    "git push": ask
    "git push *": ask
  special:
    external_directory: deny
systemPromptMode: replace
inheritProjectContext: false
inheritSkills: false
maxSubagentDepth: 0
---
