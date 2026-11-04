## Implementation guidance

- Inspect an analogous implementation and match existing repository architecture, naming, style,
  and tooling, applying the shared code-quality guidance when choosing what to reuse or add.
- Refactor only within the approved change boundary when it directly simplifies implementation or
  reduces risk; separate behavior-preserving refactors from behavior changes.
- Declare approved dependencies through the established mechanism.
- Never put credentials or secrets in source, artifacts, logs, tests, or examples.
- Remove code, generated outputs, temporary helpers, and debug artifacts made obsolete by this
  change. Preserve unrelated work and report pre-existing problems without correcting them.
