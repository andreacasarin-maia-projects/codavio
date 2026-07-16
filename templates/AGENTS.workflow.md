## AI development workflow

Use the project-local OpenCode workflow commands:

- `/define` is the single entry point. It classifies work as QUICK, BUGFIX, or FEATURE.
- QUICK skips formal planning when scope and risk are low.
- BUGFIX requires reproduction and an automated regression test before the fix.
- FEATURE requires an approved definition and `/plan` before `/build`.
- `/review` is a separate read-only gate.
- `/ship` only verifies, commits, and pushes; it does not refactor or fix unrelated issues.

Testing defaults to integration and end-to-end coverage. Add unit tests only for unusually complex isolated logic.

At the start of a session, inspect the current branch and Git status. If `.ai/work/<branch-slug>.md` exists, read it and use it as the active state. Keep active work files compact by rewriting summaries rather than appending transcripts or raw logs.

Use worktrees for planned features, risky changes, dirty repositories with unrelated edits, and parallel writing agents. Do not create a worktree for a low-risk quick change in a clean repository.
