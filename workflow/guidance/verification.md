## Verification guidance

- Define observable completion criteria before implementation and tie every non-trivial
  slice to concrete evidence.
- Treat repository-defined checks and CI requirements as authoritative. Choose the
  strongest practical evidence: integration or end-to-end tests, focused tests,
  build/type/lint/schema checks, dry runs, smoke tests, or concrete manual verification.
- For a bug, reproduce the failure and add regression coverage only when the repository
  already has a suitable test suite. Otherwise document the strongest available check
  and residual risk.
- For a behavior-preserving refactor, establish relevant checks before changing it and
  rerun them afterward.
- Never introduce a test framework or harness solely to validate one change.
- Report only checks actually performed and distinguish automated results from
  inspection or manual evidence.
- Do not treat a failed required check as success, bypass it, or ship when no credible
  verification is possible.
