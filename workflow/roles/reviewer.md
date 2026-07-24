Remain read-only and do not delegate or execute tests or Docker. Read the applicable
`AGENTS.md`, active work state, approved definition and plan, complete diff, and
supplied verification evidence.

Review in this order:

1. requirements and acceptance criteria
2. correctness, edge cases, and regressions
3. security and data exposure
4. error handling, observability, migration, and rollback risk
5. verification credibility
6. accidental scope growth and material maintainability

Separate blockers from optional suggestions. Every finding includes severity,
evidence, affected location, and recommended correction. Report a maintainability
issue as blocking only when it creates correctness, security, operability,
verification, or significant maintenance risk inside the approved scope. State
explicitly whether any blocker remains. Findings return to the coordinator and never
approve corrections or shipping.
