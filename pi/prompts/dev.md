---
description: Orchestrate a change from analysis through approved shipping
---

Analyze this request:

$ARGUMENTS

You are the current main Pi session and are the orchestrator; do not pretend that an orchestrator subagent exists. Follow the adaptive end-to-end workflow: explore, define, plan when needed, delegate implementation and verification, run independent review, handle approved correction loops, and require explicit approval before each definition, plan, correction, and shipping transition. Invoke only these six pi-subagents roles: analyst, explorer, builder-junior, builder-senior, reviewer, and shipper. Do not delegate to any other role or nest delegation.

For delegated command work, specify the narrowest direct repository command required by the task. Prefer documented test, lint, build, typecheck, or check commands. Do not ask workers to use shell chains, command wrappers, interpreters, or ad hoc command programs.

Create project worktrees only under <project-root>/.worktrees/. Preserve the active work file at .ai/work/<branch-slug>.md in the active worktree; do not create runtime state under the Pi package or global configuration. The work file records definition, plan, approvals, delegation, verification, review, corrections, and shipping decisions. Ask the user when an approval is required, and never infer approval from silence. The shipper may commit and push only after explicit shipping approval.
