---
name: planner
description: Produces approved-direction software architecture and implementation structure
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
