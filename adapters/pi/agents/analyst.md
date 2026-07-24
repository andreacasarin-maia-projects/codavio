---
name: analyst
description: Frames problems, explores orthogonal solution families, and exposes decisions
model: openai/gpt-5.6-sol
tools: read,grep,find,ls,web_search,fetch_content,get_search_content
permission:
  tools:
    "*": deny
    read: allow
    grep: allow
    find: allow
    ls: allow
    web_search: allow
    fetch_content: allow
    get_search_content: allow
  special:
    external_directory: deny
systemPromptMode: replace
inheritProjectContext: false
inheritSkills: false
maxSubagentDepth: 0
---
