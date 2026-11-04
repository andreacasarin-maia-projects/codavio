## Verification guidance

- Tie observable completion criteria to checks that exercise the changed behavior. Complete
  repository-defined checks and CI requirements; add the smallest meaningful checks for uncovered
  acceptance criteria or concrete risks. Reuse valid evidence for unchanged code and relevant
  conditions, including results already established by another required operation.
- Builders run executable checks; reviewers assess supplied evidence without executing them.
  For runnable changes, inspection or syntax alone does not establish behavioral correctness.
  A check that failed to start is blocked, not passed. Report missing prerequisites and use only
  authorized setup steps; leave verification pending when no credible check can run.
- For bugs, reproduce the failure and add regression coverage in an existing suitable suite.
  Otherwise use the strongest available check and state its limits. Never introduce a test framework
  solely for one change. For behavior-preserving refactors, check before and after.
- Report each command or manual procedure, its actual result (including exit status for commands),
  the acceptance criterion it exercises, and remaining gaps. Separate execution from inspection.
- Repeat checks when changes, failures, or new evidence invalidate their results; broaden them only
  for uncovered criteria or concrete risks. Stop when completion criteria and required checks are
  satisfied. Never bypass a failed required check or ship without credible evidence.
