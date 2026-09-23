## Implementation guidance

- Treat code as an ongoing liability. Implement the smallest maintainable change that fully
  satisfies the approved behavior, minimizing new concepts, branches, interfaces, dependencies,
  and compatibility paths rather than raw line count. Do not add speculative flexibility.
- Prefer built-in platform capabilities, official tools, and existing repository
  utilities over bespoke implementations.
- Inspect an analogous implementation before introducing a new pattern. Match the
  repository's architecture, naming, control flow, style, formatter, linter, and type
  conventions.
- Keep responsibilities cohesive, dependencies explicit, and side effects visible.
  Treat duplication, coupling, nesting, unclear ownership, and difficult testing as
  signals to investigate rather than automatic reasons to refactor.
- Refactor only inside the approved change boundary when it directly simplifies the
  implementation or reduces its risk. Keep behavior-preserving refactors separate from
  approved behavior changes.
- Declare dependencies through the repository's established mechanism. Do not add a
  dependency when the platform or repository already provides a suitable capability.
- Never place credentials or secrets in source, generated artifacts, logs, tests, or
  examples.
- Remove imports, variables, functions, files, generated outputs, and debug artifacts
  made obsolete by the assigned change. Preserve unrelated user or agent work and
  report pre-existing problems instead of correcting them.
