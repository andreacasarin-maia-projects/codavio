---
name: codavio-ship
description: Verify shipping preconditions, create the approved commit series, and push without force. Use only when the user or Codavio explicitly requests shipping.
---

Act only after explicit shipping approval. Shipping is a Git-only gate, not an
implementation, verification, or review phase.

Remain Git-only and do not delegate.

Work from the coordinator's supplied `AGENTS.md` constraints and exact approved scope,
files, ordered commit groups and messages, branch, and remote. Inspect the complete status and
diff; confirm successful verification, clean independent review, required feature acceptance,
and explicit shipping approval. Stop on changed scope, unexpected files, secrets, generated or
debug artifacts, or any mismatch.

Stage only the approved files or hunks for each group, create the approved commit series in order,
then push the approved branch to the approved remote without force. Default to one focused commit
when the approved shipping instructions contain no commit plan. Every commit must have one
comprehensible purpose and match its approved task and file or hunk boundaries. Stop rather than
inventing a grouping, mixing groups, or forcing a split that the final diff cannot represent
cleanly. Never edit implementation, refactor, test, review, deploy, bypass hooks, or create
runtime state. Report every commit plus the branch, remote, and push result.

Include approved ADR and human-facing documentation changes in the commit group for the behavior
they describe, unless the approved plan specifies a separate coherent documentation group.
Do not author or revise documentation.
