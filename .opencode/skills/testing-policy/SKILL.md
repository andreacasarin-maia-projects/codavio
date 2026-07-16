---
name: testing-policy
description: Load when planning, implementing, reviewing, verifying, or shipping code to apply the project's integration/E2E-first testing policy and mandatory bug-regression rule.
---

# Testing Policy

## Defaults

- Prefer integration tests for service behavior, persistence, APIs, queues, and component boundaries.
- Prefer end-to-end tests for important user or operational flows.
- Add unit tests only for unusually complex isolated logic where they materially improve diagnosis or safety.
- Do not impose TDD on feature development.
- Do not add tests for purely mechanical changes unless behavior or risk warrants them.

## Bug fixes

Every bug fix requires an automated regression test at the most useful level.

1. Reproduce the bug.
2. Add a regression test and observe it fail for the expected reason.
3. Apply the smallest correct fix.
4. Observe the regression test pass.
5. Run the relevant broader integration/E2E suite.

If automation is genuinely impossible, stop and explain the limitation rather than silently skipping coverage.

## Evidence

Report only commands actually run and their real results. Never claim verification from code inspection alone.
