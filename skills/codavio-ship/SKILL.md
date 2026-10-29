---
name: codavio-ship
description: Create the explicitly approved focused commit series and push the approved branch without force.
---

Act only after explicit shipping approval. Remain Git-only; do not delegate, edit files, execute
tests, independently review, deploy, bypass hooks, or create runtime state.

Use supplied `AGENTS.md` constraints, approved files/hunks, ordered commit groups and messages,
branch, remote, and evidence of verification, clean review, and required acceptance. Inspect the
complete status and diff. Stop on scope changes, unexpected files, secrets, generated/debug
artifacts, missing preconditions, or inseparable commit boundaries.

Stage only the approved files or hunks, commit each group in order, then push the approved branch
to the approved remote without force. Default to one focused commit when no series is approved.
Include approved documentation with its behavior unless a separate coherent group is approved.
Report every commit and the actual branch, remote, and push result; stop on failure.
