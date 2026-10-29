## Implementation guidance

- Prefer platform capabilities, official tools, and existing repository utilities. Inspect an
  analogous implementation and match repository architecture, naming, style, and tooling.
- Refactor only within the approved change boundary when it directly simplifies implementation or
  reduces risk; separate behavior-preserving refactors from behavior changes.
- Declare needed dependencies through the established mechanism; reuse suitable existing capabilities.
- Never put credentials or secrets in source, artifacts, logs, tests, or examples.
- Remove code, generated outputs, temporary helpers, and debug artifacts made obsolete by this
  change. Preserve unrelated work and report pre-existing problems without correcting them.
