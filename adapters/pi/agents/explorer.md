---
name: explorer
description: Performs fast read-only repository exploration with file and line evidence
model: openai/gpt-5.4-mini
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
