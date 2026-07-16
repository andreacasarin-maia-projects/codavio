---
name: implementation-planning
description: Load when converting an approved feature definition into bounded implementation tasks, worker assignments, verification criteria, and worktree boundaries.
---

# Implementation Planning

Create the smallest plan that removes execution ambiguity.

Each task needs:

- concrete outcome
- affected subsystem or likely files
- dependencies
- completion criterion
- integration/E2E verification
- cheapest safe worker class

Use `mini` only for explicit mechanical work, `luna` for normal bounded implementation, and `terra-escalation` for architecture or difficult debugging.

Prefer sequential execution. Parallelize only independent tasks with non-overlapping writes, each in its own worktree.

Do not include copied code, raw research, diffs, transcripts, speculative future work, or details recoverable from the repository. Rewrite and compact the active work file at phase changes.
