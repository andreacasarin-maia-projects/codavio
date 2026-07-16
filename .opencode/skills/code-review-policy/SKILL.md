---
name: code-review-policy
description: Load for independent review of a completed change against its approved definition, repository constraints, regression risk, operations, security, and integration/E2E coverage.
---

# Code Review Policy

Review the approved scope and complete diff. Prioritize:

1. requirement and acceptance-criteria gaps
2. correctness, edge cases, and regressions
3. security and data exposure
4. error handling, observability, migration and rollback risk
5. integration/E2E coverage
6. accidental scope growth and unnecessary complexity

Separate blocking findings from optional suggestions. Every finding must include evidence and an affected location. Do not edit code during the review. If no blocking issue exists, say so explicitly without inventing cosmetic work.
