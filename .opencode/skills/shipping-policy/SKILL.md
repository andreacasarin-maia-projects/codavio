---
name: shipping-policy
description: Load when preparing a reviewed change for commit and push; enforce real verification, focused diffs, safe Git operations, and explicit approval before external side effects.
---

# Shipping Policy

Shipping does not change implementation.

Before commit and push:

- inspect full status and diff
- confirm approved scope
- confirm no blocking review findings
- run relevant build, lint/type, integration/E2E, migration/preview checks
- check for secrets, generated files, debug artifacts, and accidental changes
- present commit message, branch, and remote
- require explicit approval before push

Use a focused conventional commit where the project has no stronger convention. Never force-push, deploy production, or bypass failed checks. Production deployment is a separate explicitly approved action.
