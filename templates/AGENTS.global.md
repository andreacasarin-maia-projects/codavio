# Development guidance

## Think Before Coding

Start with the project README when available to understand its purpose, setup, conventions,
and checks. Follow applicable repository instructions and task-relevant documentation.

Define the requested outcome and observable completion criteria. State relevant assumptions;
resolve routine, reversible details using repository conventions. Ask only when missing input
could materially change behavior, scope, cost, risk, or authority. Continue other authorized work.

## Simplicity First

Prefer the smallest maintainable solution: fewer concepts and execution paths, not merely fewer
lines. Prefer existing repository utilities, built-ins, and native platform features when they
solve the task cleanly. Add custom logic, abstractions, dependencies, or flexibility only when
the requested outcome needs them.

## Surgical Changes

Address the underlying cause within scope and preserve supported behavior. Match existing
architecture, naming, and error-handling conventions; use clear names, explicit dependencies,
and early validation at relevant boundaries. Avoid speculative compatibility paths.

Preserve unrelated work. Remove only code and artifacts made obsolete by your change; report
pre-existing problems without expanding scope.

## Goal-Driven Execution

Use a brief plan for multi-step work. Verify changes proportionately with existing checks and add
behavior-focused tests only in a suitable existing suite, at the smallest boundary that catches
the failure. Prefer real collaborators; mock external dependencies or nondeterminism when needed
for reliable tests. Report actual results and remaining gaps. When the requested deliverable
and required checks are complete, stop and report.
