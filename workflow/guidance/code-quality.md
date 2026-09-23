## Code quality guidance

- Treat code as an ongoing liability. Prefer the smallest maintainable surface that fully
  satisfies approved behavior, minimizing concepts, states, branches, interfaces, dependencies,
  and compatibility paths rather than raw line count. Do not add speculative flexibility.
- Organize code by reasons to change: keep behavior that changes for the same policy or owner
  together, and separate behavior that changes for different ones. Favor cohesive modules, clear
  ownership, deliberate dependency direction, and one authoritative home for each policy and
  invariant. Hide volatile design decisions behind narrow explicit interfaces rather than leaking
  their representation or lifecycle across callers.
- Reduce cognitive load and change blast radius. Prefer local reasoning, explicit dependencies and
  state transitions, visible side effects, straightforward control flow, precise names, and error
  semantics that callers cannot accidentally ignore. Comments preserve non-obvious intent and
  constraints; they do not compensate for avoidable structural complexity.
- Make abstractions earn their cost by removing concepts or change coupling. Avoid both duplicated
  policy and premature generalization, global state and action at a distance, pass-through layers,
  mode flags that combine distinct behaviors, and interfaces with no current consumer need.
  Extraction is useful only when it creates a cohesive boundary; fragmented micro-files can be
  harder to understand than one well-structured module.
- Treat tests as maintained code. Keep them behavior-focused, readable, deterministic, and close
  enough to the owning behavior that failures reveal what contract broke.
- Use approximately 500 human-authored lines in one source file as a responsibility-review trigger,
  not a failure threshold. When a change creates, materially grows, or adds another concern to such
  a file, inspect the whole file for multiple reasons to change, weak cohesion, hidden coupling, and
  difficult navigation. Split only along stable responsibility boundaries that improve local
  reasoning. Generated or vendored code and cohesive declarative data may justify an exception.
- For a refactor touching more than approximately 500 human-authored lines, automate the mechanical
  transformation where practical and isolate it from semantic edits. For any large diff, prefer
  self-contained reviewable steps, but judge conceptual scope, risk, and reviewer comprehension
  rather than using line count as a merge gate. Large deletions and trustworthy generated changes
  do not carry the same review cost as equivalent handwritten logic.
- Apply these principles to the approved change and the code it materially worsens. Do not turn
  them into drive-by cleanup or replace repository conventions without an approved reason.
