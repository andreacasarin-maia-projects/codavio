---
name: analyst
description: Frames problems, explores orthogonal solution families, and exposes decisions
model: openai/gpt-5.6-sol
tools: read,grep,find,ls
permission:
  tools:
    "*": deny
    read: allow
    grep: allow
    find: allow
    ls: allow
  special:
    external_directory: deny
systemPromptMode: replace
inheritProjectContext: true
inheritSkills: false
maxSubagentDepth: 0
---
